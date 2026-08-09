import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const REPO_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const FORBIDDEN_PAYLOAD_FIELDS = ["tabId", "windowId", "capturedAtMs", "eventReason"] as const;
const packageJson = JSON.parse(await readFile(join(REPO_ROOT, "package.json"), "utf8")) as { version: string };
const manifests = {
  chromium: JSON.parse(await readFile(join(REPO_ROOT, "src/chromium/manifest.json"), "utf8")) as { version: string },
  firefox: JSON.parse(await readFile(join(REPO_ROOT, "src/firefox/manifest.json"), "utf8")) as { version: string },
};

type Target = keyof typeof manifests;
type TestTab = {
  active: boolean; favIconUrl?: string; id: number; incognito: boolean; lastAccessed: number;
  title: string; url: string; windowId: number;
};
type ResponseCase = {
  body?: unknown; jsonError?: boolean; networkError?: boolean; ok?: boolean; status?: number;
};
type RequestRecord = { body?: string; headers?: Record<string, string>; method?: string; url: string };

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Runtime privacy check failed. ${message}`);
}

function listenerTarget(listeners?: Function[]) {
  return { addListener(listener: Function) { listeners?.push(listener); } };
}

function storageApi(initial: Record<string, unknown>) {
  const state = { ...initial };
  const writes: Record<string, unknown>[] = [];
  return {
    state,
    writes,
    api: {
      async get(defaults: Record<string, unknown> | null) {
        return defaults === null ? { ...state } : { ...(defaults || {}), ...state };
      },
      async remove(keys: string | string[]) {
        for (const key of Array.isArray(keys) ? keys : [keys]) delete state[key];
      },
      async set(values: Record<string, unknown>) {
        Object.assign(state, values);
        writes.push({ ...values });
      },
    },
  };
}

function bridgeResponse(testCase: ResponseCase) {
  return {
    ok: testCase.ok ?? true,
    status: testCase.status ?? ((testCase.ok ?? true) ? 200 : 500),
    async json() {
      if (testCase.jsonError) throw new Error("invalid json");
      return Object.hasOwn(testCase, "body") ? testCase.body : { enabled: true, ok: true };
    },
  };
}

async function runTarget(
  target: Target,
  tab: TestTab,
  responseCase: ResponseCase = {},
  { allowTechnicalData = true, storage = {} as Record<string, unknown>, viaMessage = false } = {},
) {
  const requests: RequestRecord[] = [];
  const messageListeners: Function[] = [];
  const localStorage = storageApi({ clientId: "test-client-id", port: "12345", token: "test-token", ...storage });
  const fetchImpl = async (rawUrl: unknown, options: unknown = {}) => {
    const url = String(rawUrl);
    if (url.includes("/_favicon/")) return { ok: false, status: 404 };
    requests.push({ url, ...(options as Omit<RequestRecord, "url">) });
    if (responseCase.networkError) throw new Error("network unavailable");
    return bridgeResponse(responseCase);
  };
  const common = {
    URL, Uint8Array, clearTimeout() {}, console, crypto: globalThis.crypto, fetch: fetchImpl,
    importScripts() {}, navigator: { userAgent: target === "firefox" ? "Mozilla/5.0 Firefox" : "Mozilla/5.0 Chrome" },
    setTimeout() { return 1; },
  };
  const api = {
    alarms: { create() {}, onAlarm: listenerTarget() },
    runtime: {
      getManifest: () => ({ version: manifests[target].version }),
      getURL: (path: string) => `${target}-extension://test${path}`,
      onInstalled: listenerTarget(), onMessage: listenerTarget(messageListeners), onStartup: listenerTarget(),
    },
    storage: { local: localStorage.api, onChanged: listenerTarget() },
    tabs: {
      onActivated: listenerTarget(), onUpdated: listenerTarget(),
      async query() { return [tab]; },
    },
    windows: { onFocusChanged: listenerTarget(), WINDOW_ID_NONE: -1 },
  };
  if (target === "firefox") {
    Object.assign(api, {
      permissions: {
        async getAll() {
          return { data_collection: allowTechnicalData ? ["technicalAndInteraction"] : [] };
        },
      },
    });
  }
  const context = vm.createContext({ ...common, [target === "firefox" ? "browser" : "chrome"]: api });
  const statusSource = await readFile(join(REPO_ROOT, "src", target, "background-status.js"), "utf8");
  const backgroundSource = await readFile(join(REPO_ROOT, "src", target, "background.js"), "utf8");
  vm.runInContext(statusSource, context, { filename: `src/${target}/background-status.js` });
  vm.runInContext(backgroundSource, context, { filename: `src/${target}/background.js` });
  if (viaMessage) {
    const listener = messageListeners[0];
    assert(listener, `${target} must register a runtime message listener.`);
    if (target === "firefox") {
      const response = await listener({ type: "patina-send-active-tab" });
      assert(response?.ok === true, `${target} manual message must resolve with ok:true.`);
    } else {
      const response = await new Promise<unknown>((resolve) => {
        const keepAlive = listener({ type: "patina-send-active-tab" }, {}, resolve);
        assert(keepAlive === true, `${target} callback listener must keep the message channel alive.`);
      });
      assert((response as { ok?: boolean })?.ok === true, `${target} manual message must respond with ok:true.`);
    }
  } else {
    await vm.runInContext('sendActiveTab("manual")', context);
  }
  return { requests, state: localStorage.state, writes: localStorage.writes };
}

function parsePayload(requests: RequestRecord[]) {
  assert(requests.length === 1, `Expected one local Web Sync request; found ${requests.length}.`);
  const request = requests[0];
  assert(request.url === "http://127.0.0.1:12345/web-activity", `Unexpected destination: ${request.url}`);
  assert(request.method === "POST", "Web Sync must use POST.");
  assert(request.headers?.Authorization === "Bearer test-token", "Local request must use the configured bearer token.");
  assert(typeof request.body === "string", "Local request must contain a JSON body.");
  return JSON.parse(request.body) as Record<string, unknown>;
}

function assertMinimalPayload(payload: Record<string, unknown>) {
  assert(payload.url === "https://example.com:8443/search?q=export-me#full-url", "Complete URL must remain exportable.");
  assert(payload.title === "Full URL export test", "Page title must remain available.");
  assert(payload.incognito === false, "Normal payload must preserve incognito:false.");
  for (const field of FORBIDDEN_PAYLOAD_FIELDS) assert(!(field in payload), `Payload must not contain ${field}.`);
}

const regularTab: TestTab = {
  active: true, favIconUrl: "https://example.com/favicon.ico", id: 42, incognito: false,
  lastAccessed: Date.now(), title: "Full URL export test",
  url: "https://example.com:8443/search?q=export-me#full-url", windowId: 7,
};

assert(packageJson.version === manifests.chromium.version, "Chromium manifest version must match package.json.");
assert(packageJson.version === manifests.firefox.version, "Firefox manifest version must match package.json.");

const chromiumPayload = parsePayload((await runTarget("chromium", regularTab)).requests);
assertMinimalPayload(chromiumPayload);
assert(chromiumPayload.browserClientId === "test-client-id", "Chromium must keep its browser client id.");
assert(chromiumPayload.browserKind === "chrome", "Chromium must identify its browser kind.");
assert(chromiumPayload.extensionVersion === manifests.chromium.version, "Chromium version must come from its manifest.");

const firefoxWithoutTechnical = parsePayload((await runTarget("firefox", regularTab, {}, { allowTechnicalData: false })).requests);
assertMinimalPayload(firefoxWithoutTechnical);
for (const field of ["browserClientId", "browserKind", "extensionVersion"]) {
  assert(!(field in firefoxWithoutTechnical), `Firefox must omit ${field} without optional consent.`);
}
const firefoxWithTechnical = parsePayload((await runTarget("firefox", regularTab)).requests);
assertMinimalPayload(firefoxWithTechnical);
assert(firefoxWithTechnical.browserKind === "firefox", "Firefox may identify itself after optional consent.");
assert(firefoxWithTechnical.extensionVersion === manifests.firefox.version, "Firefox version must come from its manifest.");

for (const target of ["chromium", "firefox"] as const) {
  const manual = await runTarget(target, regularTab, {}, { viaMessage: true });
  assertMinimalPayload(parsePayload(manual.requests));
}

for (const target of ["chromium", "firefox"] as const) {
  const cases = [
    ["success", {}, "connected", "none"],
    ["disabled 409", { ok: false, status: 409, body: { enabled: false, ok: false, code: "web-recording-disabled" } }, "disabled", "web-recording-disabled"],
    ["known rejection", { body: { ok: false, code: "invalid-web-activity-token" } }, "error", "invalid-token"],
    ["unknown rejection", { body: { ok: false, code: "future-code", message: "DO NOT DISPLAY" } }, "error", "service-rejected"],
    ["empty object", { body: {} }, "error", "invalid-response"],
    ["null json", { body: null }, "error", "invalid-response"],
    ["non-json 2xx", { jsonError: true }, "error", "invalid-response"],
    ["unauthorized 401", { ok: false, status: 401, body: { ok: false } }, "error", "invalid-token"],
    ["unauthorized 403", { ok: false, status: 403, body: { ok: false } }, "error", "invalid-token"],
    ["http error", { ok: false, status: 500, body: { ok: false } }, "error", "http-error"],
    ["network error", { networkError: true }, "error", "request-failed"],
  ] as const;
  for (const [name, responseCase, expectedStatus, expectedError] of cases) {
    const result = await runTarget(target, regularTab, responseCase, {
      storage: { lastStatus: "error", lastErrorCode: "unknown-service-error", lastErrorParams: { httpStatus: 500 } },
    });
    assertMinimalPayload(parsePayload(result.requests));
    assert(result.state.lastStatus === expectedStatus, `${target}/${name} status must be ${expectedStatus}.`);
    assert(result.state.lastErrorCode === expectedError, `${target}/${name} error must be ${expectedError}.`);
    if (name === "success") assert(JSON.stringify(result.state.lastErrorParams) === "{}", `${target}/success must clear stale error params.`);
    if (name === "http error") assert(result.state.lastErrorParams?.httpStatus === 500, `${target}/http error must retain only the status parameter.`);
    assert(!("lastMessage" in result.state), `${target}/${name} must not persist localized lastMessage.`);
    assert(!JSON.stringify(result.state).includes("DO NOT DISPLAY"), `${target}/${name} must not persist arbitrary service messages.`);
  }

  const missingToken = await runTarget(target, regularTab, {}, { storage: { token: "" } });
  assert(missingToken.requests.length === 0, `${target} must not request without a token.`);
  assert(missingToken.state.lastStatus === "needs-config", `${target} missing token status must need config.`);
  assert(missingToken.state.lastErrorCode === "missing-token", `${target} missing token must use a stable error code.`);

  const privateResult = await runTarget(target, { ...regularTab, incognito: true });
  assert(privateResult.requests.length === 0, `${target} private tabs must not send a request.`);
  assert(privateResult.state.lastStatus === "private", `${target} private tabs must use private status.`);

  const internalResult = await runTarget(target, { ...regularTab, url: target === "firefox" ? "about:addons" : "chrome://extensions" });
  assert(internalResult.requests.length === 0, `${target} internal pages must not send a request.`);
  assert(internalResult.state.lastStatus === "disconnected", `${target} internal pages must be disconnected.`);

}

const localeContext = vm.createContext({ console });
vm.runInContext(await readFile(join(REPO_ROOT, "src/chromium/generated/messages.js"), "utf8"), localeContext);
vm.runInContext(await readFile(join(REPO_ROOT, "src/chromium/i18n.js"), "utf8"), localeContext);
assert(vm.runInContext('PatinaI18n.message("zh-CN", "status.connected")', localeContext) === "已同步", "Chinese status must resolve.");
assert(vm.runInContext('PatinaI18n.message("en-US", "status.connected")', localeContext) === "Synced", "English status must resolve.");
assert(vm.runInContext('PatinaI18n.normalizeLocale("en")', localeContext) === "en-US", "Legacy en locale must migrate.");
assert(vm.runInContext('PatinaI18n.normalizeLocale("future")', localeContext) === "zh-CN", "Unknown locales must fail closed to zh-CN.");
for (const locale of ["zh-CN", "en-US"]) {
  for (const key of [
    "status.disabled", "status.disconnected", "status.connected", "status.connecting", "status.needsConfig",
    "status.configured", "status.private", "status.saving", "status.error", "error.invalidToken",
    "error.missingToken", "error.webRecordingDisabled", "error.invalidResponse", "error.serviceRejected",
    "error.requestFailed", "error.unknownService",
  ]) {
    const rendered = vm.runInContext(`PatinaI18n.message(${JSON.stringify(locale)}, ${JSON.stringify(key)})`, localeContext);
    assert(typeof rendered === "string" && rendered.length > 0 && !rendered.includes("undefined"), `${locale}/${key} must render completely.`);
  }
  const http = vm.runInContext(`PatinaI18n.message(${JSON.stringify(locale)}, "error.httpError", { httpStatus: 503 })`, localeContext);
  assert(http.includes("503") && !http.includes("{httpStatus}"), `${locale}/error.httpError must replace named parameters.`);
}
let missingParameterFailed = false;
try { vm.runInContext('PatinaI18n.message("en-US", "error.httpError")', localeContext); } catch { missingParameterFailed = true; }
assert(missingParameterFailed, "Missing localization parameters must fail closed.");

for (const target of ["chromium", "firefox"] as const) {
  const statusContext = vm.createContext({ console, Date });
  vm.runInContext(await readFile(join(REPO_ROOT, "src", target, "background-status.js"), "utf8"), statusContext);
  const normalize = (value: Record<string, unknown>) => JSON.parse(JSON.stringify(
    vm.runInContext(`PatinaStatus.normalizeStoredState(${JSON.stringify(value)})`, statusContext),
  )) as { state: Record<string, unknown>; patch: Record<string, unknown>; removeKeys: string[] };
  for (const [name, input, errorCode] of [
    ["empty", {}, "none"],
    ["legacy invalid token", { lastStatus: "error", lastMessage: "Invalid token" }, "invalid-token"],
    ["legacy missing token", { lastStatus: "needs-config", lastMessage: "请填写 Token" }, "missing-token"],
    ["legacy disabled", { lastStatus: "disabled", lastMessage: "网页同步未开启" }, "web-recording-disabled"],
    ["corrupt", { lastStatus: 42, lastErrorCode: [], lastErrorParams: { httpStatus: 900 }, lastSeenAt: "bad" }, "none"],
  ] as const) {
    const migrated = normalize(input as Record<string, unknown>);
    assert(migrated.state.lastErrorCode === errorCode, `${target}/${name} migration must map to ${errorCode}.`);
    assert(migrated.state.statusSchemaVersion === 1, `${target}/${name} migration must set schema version 1.`);
    assert(!("lastMessage" in migrated.state), `${target}/${name} migration must remove lastMessage.`);
    const applied = { ...input, ...migrated.patch };
    for (const key of migrated.removeKeys) delete (applied as Record<string, unknown>)[key];
    const repeated = normalize(applied as Record<string, unknown>);
    assert(Object.keys(repeated.patch).length === 0 && repeated.removeKeys.length === 0, `${target}/${name} migration must be idempotent.`);
  }
}

console.log("Runtime privacy, failure, migration, and locale matrix passed.");
