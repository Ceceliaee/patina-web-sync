const PROTOCOL_VERSION = 1;
const EXTENSION_VERSION = browser.runtime.getManifest().version;
const DEFAULT_PORT = "12345";
const PORT_PATTERN = /^\d{1,5}$/;
const FAVICON_URL_MAX_CHARS = 8192;
const STORAGE_DEFAULTS = {
  port: DEFAULT_PORT,
  token: "",
  clientId: "",
  lastStatus: "disabled",
  lastMessage: "",
  lastSeenAt: 0,
};

let pendingActiveTabTimer = null;

function browserKind() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("zen")) return "zen";
  if (ua.includes("floorp")) return "floorp";
  if (ua.includes("iceweasel")) return "iceweasel";
  return "firefox";
}

function setStatus(lastStatus, lastMessage = "") {
  return browser.storage.local.set({
    lastStatus,
    lastMessage,
    lastSeenAt: Date.now(),
  });
}

async function getSettings() {
  const settings = await browser.storage.local.get(STORAGE_DEFAULTS);
  let clientId = String(settings.clientId || "").trim();
  const storagePatch = {};
  if (!clientId) {
    clientId = crypto.randomUUID();
    storagePatch.clientId = clientId;
  }
  if (Object.keys(storagePatch).length > 0) {
    await browser.storage.local.set(storagePatch);
  }
  const port = normalizePort(settings.port);
  return {
    ...STORAGE_DEFAULTS,
    ...settings,
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

function isTrackableTab(tab) {
  if (isPrivateTab(tab)) return false;
  const url = String(tab?.url || "");
  return url.startsWith("http://") || url.startsWith("https://");
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

async function sendActiveTab(eventReason = "refresh") {
  const settings = await getSettings();
  if (!settings.port || !settings.token) {
    await setStatus("needs-config", "请填写端口和 Token。");
    return;
  }

  const activeTab = await getActiveTrackableTab(eventReason);
  const tab = activeTab.tab;
  if (!tab) {
    if (activeTab.reason === "private") {
      await setStatus("private");
    } else {
      await setStatus("disconnected", "当前没有可同步的网页。");
    }
    return;
  }

  await setStatus("connecting");
  const favIconUrl = resolveFaviconSource(tab);
  const payload = {
    protocolVersion: PROTOCOL_VERSION,
    browserClientId: settings.clientId,
    browserKind: browserKind(),
    extensionVersion: EXTENSION_VERSION,
    tabId: tab.id,
    windowId: tab.windowId,
    url: tab.url,
    title: tab.title,
    favIconUrl,
    incognito: tab.incognito,
    capturedAtMs: Date.now(),
    eventReason,
  };

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
    const data = await response.json().catch(() => null);
    if (data?.enabled === false) {
      await setStatus("disabled", "Patina 网页同步未开启。");
      return;
    }
    if (!response.ok || data?.ok !== true) {
      await setStatus("error", data?.message || "");
      return;
    }
    await setStatus("connected");
  } catch {
    await setStatus("error");
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
