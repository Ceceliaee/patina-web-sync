importScripts("background-status.js");

const PROTOCOL_VERSION = 1;
const statusModel = globalThis.PatinaStatus;
const EXTENSION_VERSION = chrome.runtime.getManifest().version;
const DEFAULT_PORT = "12345";
const PORT_PATTERN = /^\d{1,5}$/;
const FAVICON_DATA_URL_MAX_CHARS = 8192;
const FAVICON_DATA_URL_MAX_BYTES = 6144;
const FAVICON_CACHE_LIMIT = 128;
const STORAGE_DEFAULTS = {
  port: DEFAULT_PORT,
  token: "",
  clientId: "",
  ...statusModel.DEFAULT_STATUS_STATE,
};

let pendingActiveTabTimer = null;
let observationGeneration = 0;
let pendingReason = null;
let syncPromise = null;
let activeRequest = null;
let hasPublishedActivity = false;
const faviconDataUrlCache = new Map();

function browserKind() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("edg/")) return "edge";
  if (ua.includes("opr/") || ua.includes("opera")) return "opera";
  if (ua.includes("vivaldi")) return "vivaldi";
  if (ua.includes("brave")) return "brave";
  return "chrome";
}

function setStatus(lastStatus, lastErrorCode = "none", lastErrorParams = {}) {
  return chrome.storage.local.set(statusModel.statusPatch(lastStatus, lastErrorCode, lastErrorParams));
}

async function getSettings() {
  const stored = await chrome.storage.local.get(null);
  const settings = { ...STORAGE_DEFAULTS, ...stored };
  const migration = statusModel.normalizeStoredState(settings);
  let clientId = String(settings.clientId || "").trim();
  const storagePatch = { ...migration.patch };
  if (!clientId) {
    clientId = crypto.randomUUID();
    storagePatch.clientId = clientId;
  }
  if (Object.keys(storagePatch).length > 0) {
    await chrome.storage.local.set(storagePatch);
  }
  if (migration.removeKeys.length > 0) await chrome.storage.local.remove(migration.removeKeys);
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
  return tab?.active === true && Boolean(toTrackableUrl(tab?.url));
}

function isPrivateTab(tab) {
  return tab?.incognito === true;
}

async function getActiveTrackableTab() {
  const window = await chrome.windows.getLastFocused();
  if (!window?.focused) return { tab: null, reason: "none" };
  if (window.incognito === true) return { tab: null, reason: "private" };
  const activeTabs = await chrome.tabs.query({ active: true, windowId: window.id });
  const activeTab = activeTabs[0];
  if (isPrivateTab(activeTab)) return { tab: null, reason: "private" };
  return isTrackableTab(activeTab) ? { tab: activeTab, reason: "" } : { tab: null, reason: "none" };
}

function rememberFaviconDataUrl(favIconUrl, dataUrl) {
  faviconDataUrlCache.set(favIconUrl, dataUrl);
  if (faviconDataUrlCache.size <= FAVICON_CACHE_LIMIT) return;
  const firstKey = faviconDataUrlCache.keys().next().value;
  if (firstKey) faviconDataUrlCache.delete(firstKey);
}

async function blobToDataUrl(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return `data:${blob.type || "image/png"};base64,${btoa(binary)}`;
}

function chromeCachedFaviconUrl(pageUrl) {
  const faviconUrl = new URL(chrome.runtime.getURL("/_favicon/"));
  faviconUrl.searchParams.set("pageUrl", pageUrl);
  faviconUrl.searchParams.set("size", "32");
  return faviconUrl.toString();
}

async function resolveFaviconSource(tab) {
  const raw = String(tab?.favIconUrl || "").trim();
  if (raw.startsWith("data:")) {
    return raw.length <= FAVICON_DATA_URL_MAX_CHARS ? raw : undefined;
  }

  const pageUrl = String(tab?.url || "").trim();
  if (!pageUrl.startsWith("http://") && !pageUrl.startsWith("https://")) return raw || undefined;

  const cacheKey = `${pageUrl}::${raw}`;
  const cached = faviconDataUrlCache.get(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(chromeCachedFaviconUrl(pageUrl), {
      cache: "force-cache",
      signal: AbortSignal.timeout(2_000),
    });
    if (!response.ok) return raw || undefined;
    const blob = await response.blob();
    if (blob.size <= 0 || blob.size > FAVICON_DATA_URL_MAX_BYTES) return raw || undefined;
    const dataUrl = await blobToDataUrl(blob);
    if (dataUrl.length > FAVICON_DATA_URL_MAX_CHARS) return raw || undefined;
    rememberFaviconDataUrl(cacheKey, dataUrl);
    return dataUrl;
  } catch {
    return raw || undefined;
  }
}

async function sendObservation(eventReason, generation) {
  const settings = await getSettings();
  if (!settings.port || !settings.token) {
    await setStatus("needs-config", settings.token ? "none" : "missing-token");
    return;
  }

  const published = await chrome.storage.local.get({ webActivityPublished: false });
  hasPublishedActivity = hasPublishedActivity || published.webActivityPublished === true;
  const activeTab = await getActiveTrackableTab(eventReason);
  const tab = activeTab.tab;
  if (generation !== observationGeneration) return;
  const inactiveStatus = activeTab.reason === "private" ? "private" : "disconnected";
  if (!tab && !hasPublishedActivity) {
    await setStatus(inactiveStatus);
    return;
  }
  // A fixed non-page sentinel revokes our previous observation without exposing
  // the new private/internal page or the reason it stopped being recordable.
  const payload = {
    protocolVersion: PROTOCOL_VERSION,
    browserClientId: settings.clientId,
    browserKind: browserKind(),
    extensionVersion: EXTENSION_VERSION,
    url: tab ? toTrackableUrl(tab.url) : "about:blank",
    ...(tab ? { title: tab.title, favIconUrl: await resolveFaviconSource(tab) } : {}),
    incognito: false,
  };
  const current = await getActiveTrackableTab();
  if (generation !== observationGeneration) return;
  if (tab ? (!current.tab || current.tab.id !== tab.id || current.tab.windowId !== tab.windowId || current.tab.url !== tab.url || current.tab.title !== tab.title) : current.tab) return;
  await setStatus(tab ? "connecting" : inactiveStatus);
  if (generation !== observationGeneration) return;
  activeRequest = new AbortController();
  const timeout = setTimeout(() => activeRequest?.abort(), 5_000);
  try {
    if (tab) {
      hasPublishedActivity = true;
      await chrome.storage.local.set({ webActivityPublished: true });
      if (generation !== observationGeneration) return;
    }
    const response = await fetch(webActivityUrl(endpointFromPort(settings.port)), {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${settings.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: activeRequest.signal,
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
    if (generation !== observationGeneration) return;
    if (!tab && result.lastStatus === "connected") {
      hasPublishedActivity = false;
      await chrome.storage.local.set({ webActivityPublished: false });
    }
    await setStatus(tab ? result.lastStatus : inactiveStatus, tab ? result.lastErrorCode : "none", tab ? result.lastErrorParams : {});
    // A focus notification can precede the desktop's next native sample.
    // Retry one fresh observation, without extending or replaying the old one.
    if (generation === observationGeneration && tab && result.lastStatus === "connected" && data?.changed === false && eventReason !== "native-retry") {
      if (pendingActiveTabTimer) clearTimeout(pendingActiveTabTimer);
      pendingActiveTabTimer = setTimeout(() => {
        pendingActiveTabTimer = null;
        if (generation === observationGeneration) void sendActiveTab("native-retry");
      }, 1_000);
    }
  } catch {
    if (generation === observationGeneration) await setStatus("error", "request-failed");
  } finally {
    clearTimeout(timeout);
    activeRequest = null;
  }
}

function sendActiveTab(eventReason = "refresh") {
  observationGeneration += 1;
  pendingReason = eventReason;
  activeRequest?.abort();
  if (!syncPromise) {
    syncPromise = (async () => {
      while (pendingReason !== null) {
        const reason = pendingReason;
        pendingReason = null;
        const generation = observationGeneration;
        try { await sendObservation(reason, generation); }
        catch { if (generation === observationGeneration) await setStatus("error", "request-failed"); }
      }
    })().finally(() => { syncPromise = null; });
  }
  return syncPromise;
}

function queueActiveTab(eventReason) {
  observationGeneration += 1;
  activeRequest?.abort();
  if (pendingActiveTabTimer) clearTimeout(pendingActiveTabTimer);
  pendingActiveTabTimer = setTimeout(() => {
    pendingActiveTabTimer = null;
    void sendActiveTab(eventReason);
  }, 200);
}

chrome.runtime.onInstalled.addListener(() => {
  void getSettings().then(() => queueActiveTab("installed"));
  chrome.alarms.create("patina-active-tab-sync", { periodInMinutes: 0.5 });
});

chrome.runtime.onStartup.addListener(() => {
  queueActiveTab("startup");
  chrome.alarms.create("patina-active-tab-sync", { periodInMinutes: 0.5 });
});

chrome.tabs.onActivated.addListener(() => queueActiveTab("tab-activated"));
chrome.tabs.onRemoved.addListener(() => queueActiveTab("tab-removed"));
chrome.windows.onRemoved.addListener(() => queueActiveTab("window-removed"));
chrome.windows.onFocusChanged.addListener(() => {
  queueActiveTab("window-focus-changed");
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!tab.active) return;
  if (changeInfo.url || changeInfo.title || changeInfo.status === "complete" || changeInfo.favIconUrl) {
    queueActiveTab("tab-updated");
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== "patina-active-tab-sync") return;
  queueActiveTab("periodic");
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;
  if (changes.port || changes.token) queueActiveTab("settings-changed");
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "patina-connect-now" || message?.type === "patina-send-active-tab") {
    void sendActiveTab("manual").then(() => sendResponse({ ok: true }));
    return true;
  }
  return false;
});

queueActiveTab("startup");
