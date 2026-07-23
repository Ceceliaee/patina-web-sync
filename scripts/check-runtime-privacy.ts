import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const REPO_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const FORBIDDEN_PAYLOAD_FIELDS = ["tabId", "windowId", "capturedAtMs", "eventReason"] as const;

type TestTab = {
  active: boolean;
  favIconUrl?: string;
  id: number;
  incognito: boolean;
  lastAccessed: number;
  title: string;
  url: string;
  windowId: number;
};

type RequestRecord = {
  body?: string;
  headers?: Record<string, string>;
  method?: string;
  url: string;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Runtime privacy check failed. ${message}`);
}

function listenerTarget() {
  return { addListener() {} };
}

function storageApi() {
  return {
    async get() {
      return {
        clientId: "test-client-id",
        port: "12345",
        token: "test-token",
      };
    },
    async set() {},
  };
}

function response() {
  return {
    ok: true,
    async json() {
      return { enabled: true, ok: true };
    },
  };
}

function commonContext(fetchImpl: (...args: unknown[]) => Promise<unknown>) {
  return {
    URL,
    clearTimeout() {},
    console,
    crypto: globalThis.crypto,
    fetch: fetchImpl,
    Map,
    navigator: { userAgent: "Mozilla/5.0 Test Browser" },
    setTimeout() {
      return 1;
    },
    Uint8Array,
  };
}

async function runChromium(tab: TestTab) {
  const requests: RequestRecord[] = [];
  const context = vm.createContext({
    ...commonContext(async (rawUrl: unknown, options: unknown = {}) => {
      const url = String(rawUrl);
      if (url.includes("/_favicon/")) return { ok: false };
      requests.push({ url, ...(options as Omit<RequestRecord, "url">) });
      return response();
    }),
    chrome: {
      alarms: { create() {}, onAlarm: listenerTarget() },
      runtime: {
        getManifest: () => ({ version: "0.2.0" }),
        getURL: (path: string) => `chrome-extension://test${path}`,
        onInstalled: listenerTarget(),
        onMessage: listenerTarget(),
        onStartup: listenerTarget(),
      },
      storage: { local: storageApi(), onChanged: listenerTarget() },
      tabs: {
        onActivated: listenerTarget(),
        onUpdated: listenerTarget(),
        async query() {
          return [tab];
        },
      },
      windows: { onFocusChanged: listenerTarget(), WINDOW_ID_NONE: -1 },
    },
  });
  const source = await readFile(join(REPO_ROOT, "src", "chromium", "background.js"), "utf8");
  vm.runInContext(source, context, { filename: "src/chromium/background.js" });
  await vm.runInContext('sendActiveTab("manual")', context);
  return requests;
}

async function runFirefox(tab: TestTab, allowTechnicalData: boolean) {
  const requests: RequestRecord[] = [];
  const context = vm.createContext({
    ...commonContext(async (rawUrl: unknown, options: unknown = {}) => {
      requests.push({ url: String(rawUrl), ...(options as Omit<RequestRecord, "url">) });
      return response();
    }),
    browser: {
      alarms: { create() {}, onAlarm: listenerTarget() },
      permissions: {
        async getAll() {
          return {
            data_collection: allowTechnicalData ? ["technicalAndInteraction"] : [],
          };
        },
      },
      runtime: {
        getManifest: () => ({ version: "0.2.0" }),
        onInstalled: listenerTarget(),
        onMessage: listenerTarget(),
        onStartup: listenerTarget(),
      },
      storage: { local: storageApi(), onChanged: listenerTarget() },
      tabs: {
        onActivated: listenerTarget(),
        onUpdated: listenerTarget(),
        async query() {
          return [tab];
        },
      },
      windows: { onFocusChanged: listenerTarget(), WINDOW_ID_NONE: -1 },
    },
  });
  const source = await readFile(join(REPO_ROOT, "src", "firefox", "background.js"), "utf8");
  vm.runInContext(source, context, { filename: "src/firefox/background.js" });
  await vm.runInContext('sendActiveTab("manual")', context);
  return requests;
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
  assert(
    payload.url === "https://example.com:8443/search?q=export-me#full-url",
    `Expected the complete exportable webpage URL; found ${String(payload.url)}.`,
  );
  assert(payload.title === "Full URL export test", "Page title should remain available as website context.");
  assert(payload.incognito === false, "Normal payload must preserve incognito:false.");
  for (const field of FORBIDDEN_PAYLOAD_FIELDS) {
    assert(!(field in payload), `Payload must not contain ${field}.`);
  }
}

const regularTab: TestTab = {
  active: true,
  favIconUrl: "https://example.com/favicon.ico",
  id: 42,
  incognito: false,
  lastAccessed: Date.now(),
  title: "Full URL export test",
  url: "https://example.com:8443/search?q=export-me#full-url",
  windowId: 7,
};

const chromiumPayload = parsePayload(await runChromium(regularTab));
assertMinimalPayload(chromiumPayload);
assert(chromiumPayload.browserClientId === "test-client-id", "Chromium must keep its local browser client id.");
assert(chromiumPayload.browserKind === "chrome", "Chromium must identify its browser kind.");
assert(chromiumPayload.extensionVersion === "0.2.0", "Chromium must identify its extension version.");

const firefoxWithoutTechnical = parsePayload(await runFirefox(regularTab, false));
assertMinimalPayload(firefoxWithoutTechnical);
for (const field of ["browserClientId", "browserKind", "extensionVersion"]) {
  assert(!(field in firefoxWithoutTechnical), `Firefox must omit ${field} when optional consent is absent.`);
}

const firefoxWithTechnical = parsePayload(await runFirefox(regularTab, true));
assertMinimalPayload(firefoxWithTechnical);
assert(firefoxWithTechnical.browserClientId === "test-client-id", "Firefox may send client id after optional consent.");
assert(firefoxWithTechnical.browserKind === "firefox", "Firefox may send browser kind after optional consent.");
assert(firefoxWithTechnical.extensionVersion === "0.2.0", "Firefox may send extension version after optional consent.");

const privateRequests = await runChromium({ ...regularTab, incognito: true });
assert(privateRequests.length === 0, "Private Chromium tabs must not send a request.");

const firefoxPrivateRequests = await runFirefox({ ...regularTab, incognito: true }, true);
assert(firefoxPrivateRequests.length === 0, "Private Firefox tabs must not send a request, even with technical consent.");

const internalRequests = await runChromium({ ...regularTab, url: "chrome://extensions" });
assert(internalRequests.length === 0, "Browser-internal pages must not send a request.");

const maintainerDocs = [
  {
    path: "src/chromium/README.md",
    required: [
      "chromewebstore.google.com/detail/patina-web-sync/gimdckblhckibmeklhemgccabmbnoemd",
      "microsoftedge.microsoft.com/addons/detail/gogmlpjhbfjghilmpcciedplifdiibai",
      "The zip root contains `manifest.json`.",
      "Tab/window id, timestamps, and event reason stay out of the payload.",
    ],
    forbidden: [
      "not published in either store yet",
      "The zip contains a versioned extension folder.",
    ],
  },
  {
    path: "src/chromium/README.zh-CN.md",
    required: [
      "chromewebstore.google.com/detail/patina-web-sync/gimdckblhckibmeklhemgccabmbnoemd",
      "microsoftedge.microsoft.com/addons/detail/gogmlpjhbfjghilmpcciedplifdiibai",
      "zip 根目录直接包含 `manifest.json`",
      "不发送标签页/窗口 ID、采集时间或事件原因",
    ],
    forbidden: [
      "当前扩展尚未发布到这两个商店",
      "zip 内包含一个带版本号的扩展目录",
    ],
  },
  {
    path: "src/firefox/README.md",
    required: [
      "addons.mozilla.org/firefox/addon/patina-web-sync/",
      "public listed AMO `.xpi`",
      "The formal GitHub Release XPI is not signed locally.",
      "Tab/window id, timestamps, and event reason stay out of the payload.",
    ],
    forbidden: [
      "the extension is not listed on AMO yet",
      "user-facing GitHub Release package is a Mozilla AMO `unlisted` signed `.xpi`",
    ],
  },
  {
    path: "src/firefox/README.zh-CN.md",
    required: [
      "addons.mozilla.org/zh-CN/firefox/addon/patina-web-sync/",
      "AMO 同版本公开 listed XPI",
      "正式 GitHub Release XPI 不在本地重新签名",
      "不发送标签页/窗口 ID、采集时间或事件原因",
    ],
    forbidden: [
      "当前扩展尚未 listed on AMO",
      "GitHub Release 用户安装包是经 Mozilla AMO `unlisted` 签名的 `.xpi`",
    ],
  },
] as const;

for (const doc of maintainerDocs) {
  const content = await readFile(join(REPO_ROOT, doc.path), "utf8");
  for (const text of doc.required) {
    assert(content.includes(text), `${doc.path} must include current distribution or payload text: ${text}`);
  }
  for (const text of doc.forbidden) {
    assert(!content.includes(text), `${doc.path} still contains retired distribution or payload text: ${text}`);
  }
}

console.log("Runtime privacy check passed.");
