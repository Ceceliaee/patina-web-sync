// Target copies are generated from this shared source.
const SETTINGS_DEFAULTS = { port: "12345", token: "", language: "zh-CN" };
const platform = globalThis.PatinaPlatform;
const i18n = globalThis.PatinaI18n;
const statusModel = globalThis.PatinaStatus;
const statusBadge = document.querySelector("#status-badge");
const tabLabel = document.querySelector("#tab-label");
const tabTitle = document.querySelector("#tab-title");
const tabUrl = document.querySelector("#tab-url");
const optionsButton = document.querySelector("#options");
const sendTabButton = document.querySelector("#send-tab");

async function readSettings() {
  const stored = await platform.storageGet(null);
  const raw = { ...SETTINGS_DEFAULTS, ...statusModel.DEFAULT_STATUS_STATE, ...stored };
  const migration = statusModel.normalizeStoredState(raw);
  const language = i18n.normalizeLocale(raw.language);
  const patch = { ...migration.patch };
  if (language !== raw.language) patch.language = language;
  if (Object.keys(patch).length > 0) await platform.storageSet(patch);
  if (migration.removeKeys.length > 0) await platform.storageRemove(migration.removeKeys);
  return { ...migration.state, language, port: String(raw.port || ""), token: String(raw.token || "") };
}

function hasConfig(settings) {
  return Boolean(settings.port.trim() && settings.token.trim());
}

function isTrackableUrl(url) {
  return String(url || "").startsWith("http://") || String(url || "").startsWith("https://");
}

function formatDomain(url) {
  try { return new URL(url).hostname; } catch { return ""; }
}

function statusView(settings, locale) {
  if (!hasConfig(settings) || settings.lastStatus === "needs-config") {
    return { badge: i18n.message(locale, "status.needsConfig"), tone: "danger", canSync: false };
  }
  const views = {
    connected: ["status.connected", "success"], connecting: ["status.connecting", "neutral"],
    configured: ["status.configured", "neutral"], disabled: ["status.disabled", "neutral"],
    disconnected: ["status.disconnected", "neutral"], private: ["popup.privateBadge", "neutral"],
    error: ["status.error", "danger"],
  };
  const [key, tone] = views[settings.lastStatus] || views.configured;
  return { badge: i18n.message(locale, key), tone, canSync: true };
}

async function render() {
  const settings = await readSettings();
  const locale = i18n.applyDocument(settings.language);
  const [activeTab] = await platform.queryTabs({ active: true, lastFocusedWindow: true });
  const view = statusView(settings, locale);
  const privateTab = activeTab?.incognito === true;
  const trackable = !privateTab && isTrackableUrl(activeTab?.url);
  const configured = hasConfig(settings);
  const blockedByPage = Boolean(configured && !trackable);

  statusBadge.textContent = privateTab && configured
    ? i18n.message(locale, "popup.privateBadge")
    : blockedByPage ? i18n.message(locale, "status.error") : view.badge;
  statusBadge.dataset.tone = blockedByPage ? "neutral" : view.tone;
  tabTitle.textContent = privateTab
    ? i18n.message(locale, "popup.privateHelp")
    : trackable ? formatDomain(activeTab.url) : (activeTab?.title || i18n.message(locale, "popup.noActivePage"));
  tabUrl.textContent = privateTab ? "" : trackable ? (activeTab?.title || "") : i18n.message(locale, "popup.httpOnly");
  sendTabButton.textContent = i18n.message(locale, view.canSync ? "popup.syncCurrentPage" : "popup.completeSetup");
  sendTabButton.disabled = Boolean(configured && !trackable);
  sendTabButton.dataset.mode = view.canSync ? "sync" : "options";
  tabLabel.textContent = i18n.message(locale, "popup.currentPageLabel");
  optionsButton.textContent = i18n.message(locale, "popup.settings");
}

optionsButton.addEventListener("click", () => { void platform.openOptionsPage(); });
sendTabButton.addEventListener("click", async () => {
  if (sendTabButton.dataset.mode === "options") { void platform.openOptionsPage(); return; }
  const settings = await readSettings();
  const locale = i18n.normalizeLocale(settings.language);
  statusBadge.textContent = i18n.message(locale, "status.connecting");
  statusBadge.dataset.tone = "neutral";
  try {
    await platform.sendMessage({ type: "patina-send-active-tab" });
    window.setTimeout(() => void render(), 500);
  } catch {
    statusBadge.textContent = i18n.message(locale, "status.error");
    statusBadge.dataset.tone = "danger";
  }
});
platform.onStorageChanged((changes, areaName) => {
  if (areaName !== "local") return;
  if (["port", "token", "language", "lastStatus", "lastErrorCode", "lastErrorParams", "statusSchemaVersion"]
    .some((key) => changes[key])) void render();
});

void render();
