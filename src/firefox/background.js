const PROTOCOL_VERSION = 1;
const statusModel = globalThis.PatinaStatus;
const EXTENSION_VERSION = browser.runtime.getManifest().version;
const DEFAULT_PORT = "12345";
const PORT_PATTERN = /^\d{1,5}$/;
const FAVICON_URL_MAX_CHARS = 8192;
const STORAGE_DEFAULTS = {
  port: DEFAULT_PORT,
  token: "",
  clientId: "",
  ...statusModel.DEFAULT_STATUS_STATE,
};

let pendingActiveTabTimer = null;

function browserKind() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("zen")) return "zen";
  if (ua.includes("floorp")) return "floorp";
  if (ua.includes("iceweasel")) return "iceweasel";
  return "firefox";
}

function setStatus(lastStatus, lastErrorCode = "none", lastErrorParams = {}) {
  return browser.storage.local.set(statusModel.statusPatch(lastStatus, lastErrorCode, lastErrorParams));
}

async function getSettings() {
  const stored = await browser.storage.local.get(null);
  const settings = { ...STORAGE_DEFAULTS, ...stored };
  const migration = statusModel.normalizeStoredState(settings);
  let clientId = String(settings.clientId || "").trim();
  const storagePatch = { ...migration.patch };
  if (!clientId) {
    clientId = crypto.randomUUID();
    storagePatch.clientId = clientId;
  }
  if (Object.keys(storagePatch).length > 0) {
    await browser.storage.local.set(storagePatch);
  }
  if (migration.removeKeys.length > 0) await browser.storage.local.remove(migration.removeKeys);
  const port = normalizePort(settings.port);
  return {
    ...STORAGE_DEFAULTS,
    ...migration.state,
    clientId,
    port,
    token: String(settings.token || "").trim(),
  };
}

function normalizePort(rawPort, fallback = DEFAULT_PORT) {
  const value = String(rawPort || "").trim();
  if (!PORT_PATTERN.test(value)) return fallback;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) return fallback;
  return String(port);
}

function endpointFromPort(port) {
  return `http://127.0.0.1:${port}`;
}

function webActivityUrl(endpoint) {
  const url = new URL(endpoint);
  if (!url.pathname || url.pathname === "/") {
    url.pathname = "/web-activity";
  }
  return url.toString();
}

function toTrackableUrl(rawUrl) {
  const value = String(rawUrl || "").trim();
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return value;
  } catch {
    return "";
  }
}

function isTrackableTab(tab) {
  if (isPrivateTab(tab)) return false;
  return Boolean(toTrackableUrl(tab?.url));
}

function isPrivateTab(tab) {
  return tab?.incognito === true;
}

async function getActiveTrackableTab(eventReason) {
  const activeTabs = await browser.tabs.query({ active: true, lastFocusedWindow: true });
  const activeTab = activeTabs[0];
  if (isPrivateTab(activeTab)) return { tab: null, reason: "private" };
  if (isTrackableTab(activeTab)) return { tab: activeTab, reason: "" };
  if (eventReason !== "manual") return { tab: null, reason: "none" };

  const tabs = await browser.tabs.query({ lastFocusedWindow: true });
  const fallbackTab = tabs
    .filter(isTrackableTab)
    .sort((left, right) => (right.lastAccessed || 0) - (left.lastAccessed || 0))[0] || null;
  return { tab: fallbackTab, reason: fallbackTab ? "" : "none" };
}

function resolveFaviconSource(tab) {
  const raw = String(tab?.favIconUrl || "").trim();
  if (!raw) return undefined;
  if (raw.length > FAVICON_URL_MAX_CHARS) return undefined;
  return raw;
}

async function allowsTechnicalData() {
  try {
    const permissions = await browser.permissions.getAll();
    return permissions.data_collection?.includes("technicalAndInteraction") === true;
  } catch {
    return false;
  }
}

async function sendActiveTab(eventReason = "refresh") {
  const settings = await getSettings();
  if (!settings.port || !settings.token) {
    await setStatus("needs-config", settings.token ? "none" : "missing-token");
    return;
  }

  const activeTab = await getActiveTrackableTab(eventReason);
  const tab = activeTab.tab;
  if (!tab) {
    if (activeTab.reason === "private") {
      await setStatus("private");
    } else {
      await setStatus("disconnected");
    }
    return;
  }

  await setStatus("connecting");
  const fullUrl = toTrackableUrl(tab.url);
  if (!fullUrl) {
    await setStatus("disconnected");
    return;
  }
  const favIconUrl = resolveFaviconSource(tab);
  const payload = {
    protocolVersion: PROTOCOL_VERSION,
    url: fullUrl,
    title: tab.title,
    favIconUrl,
    incognito: tab.incognito,
  };
  if (await allowsTechnicalData()) {
    Object.assign(payload, {
      browserClientId: settings.clientId,
      browserKind: browserKind(),
      extensionVersion: EXTENSION_VERSION,
    });
  }

  try {
    const response = await fetch(webActivityUrl(endpointFromPort(settings.port)), {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${settings.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    let data = null;
    let jsonParsed = false;
    try {
      data = await response.json();
      jsonParsed = true;
    } catch {
      jsonParsed = false;
    }
    const result = statusModel.classifyBridgeResponse(response, data, jsonParsed);
    await setStatus(result.lastStatus, result.lastErrorCode, result.lastErrorParams);
  } catch {
    await setStatus("error", "request-failed");
  }
}

function queueActiveTab(eventReason) {
  if (pendingActiveTabTimer) clearTimeout(pendingActiveTabTimer);
  pendingActiveTabTimer = setTimeout(() => {
    pendingActiveTabTimer = null;
    void sendActiveTab(eventReason);
  }, 200);
}

browser.runtime.onInstalled.addListener(() => {
  void getSettings().then(() => queueActiveTab("installed"));
  browser.alarms.create("patina-active-tab-sync", { periodInMinutes: 0.5 });
});

browser.runtime.onStartup.addListener(() => {
  queueActiveTab("startup");
  browser.alarms.create("patina-active-tab-sync", { periodInMinutes: 0.5 });
});

browser.tabs.onActivated.addListener(() => queueActiveTab("tab-activated"));
browser.windows.onFocusChanged.addListener((windowId) => {
  if (windowId !== browser.windows.WINDOW_ID_NONE) queueActiveTab("window-focused");
});
browser.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (!tab.active) return;
  if (changeInfo.url || changeInfo.title || changeInfo.status === "complete" || changeInfo.favIconUrl) {
    queueActiveTab("tab-updated");
  }
});

browser.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== "patina-active-tab-sync") return;
  queueActiveTab("periodic");
});

browser.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;
  if (changes.port || changes.token) queueActiveTab("settings-changed");
});

browser.runtime.onMessage.addListener((message) => {
  if (message?.type === "patina-connect-now" || message?.type === "patina-send-active-tab") {
    return sendActiveTab("manual").then(() => ({ ok: true }));
  }
  return false;
});

queueActiveTab("startup");
