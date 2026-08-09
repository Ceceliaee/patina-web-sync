// Target copies are generated from this shared source.
const DEFAULT_PORT = "12345";
const PORT_PATTERN = /^\d{1,5}$/;
const SETTINGS_DEFAULTS = { port: DEFAULT_PORT, token: "", language: "zh-CN" };
const platform = globalThis.PatinaPlatform;
const i18n = globalThis.PatinaI18n;
const statusModel = globalThis.PatinaStatus;

const form = document.querySelector("#options-form");
const portInput = document.querySelector("#port");
const tokenInput = document.querySelector("#token");
const statusText = document.querySelector("#status");
const testButton = document.querySelector("#test");
const toggleTokenButton = document.querySelector("#toggle-token");
const languageButton = document.querySelector("#language-button");
const languageMenu = document.querySelector("#language-menu");
const languageOptions = Array.from(document.querySelectorAll("[data-language-option]"));

let currentLanguage = "zh-CN";
let currentSettings = { ...SETTINGS_DEFAULTS, ...statusModel.DEFAULT_STATUS_STATE };
let saveTimer = null;

function normalizePort(rawPort, fallback = DEFAULT_PORT) {
  const value = String(rawPort || "").trim();
  if (!PORT_PATTERN.test(value)) return fallback;
  const port = Number(value);
  return Number.isInteger(port) && port >= 1024 && port <= 65535 ? String(port) : fallback;
}

function isValidPort(rawPort) {
  return normalizePort(rawPort, "") !== "";
}

async function readSettings() {
  const stored = await platform.storageGet(null);
  const raw = { ...SETTINGS_DEFAULTS, ...statusModel.DEFAULT_STATUS_STATE, ...stored };
  const migration = statusModel.normalizeStoredState(raw);
  const language = i18n.normalizeLocale(raw.language);
  const port = normalizePort(raw.port);
  const patch = { ...migration.patch };
  if (language !== raw.language) patch.language = language;
  if (port !== raw.port) patch.port = port;
  if (Object.keys(patch).length > 0) await platform.storageSet(patch);
  if (migration.removeKeys.length > 0) await platform.storageRemove(migration.removeKeys);
  return { ...migration.state, language, port, token: String(raw.token || "") };
}

function setStatus(label, tone = "neutral", state = "") {
  statusText.textContent = label;
  statusText.dataset.tone = tone;
  statusText.dataset.state = state;
}

const errorMessageKeys = {
  "invalid-token": "error.invalidToken",
  "missing-token": "error.missingToken",
  "web-recording-disabled": "error.webRecordingDisabled",
  "http-error": "error.httpError",
  "invalid-response": "error.invalidResponse",
  "service-rejected": "error.serviceRejected",
  "request-failed": "error.requestFailed",
  "unknown-service-error": "error.unknownService",
};

function statusView(settings) {
  const errorKey = errorMessageKeys[settings.lastErrorCode];
  if (errorKey) {
    const params = settings.lastErrorCode === "http-error"
      ? { httpStatus: settings.lastErrorParams?.httpStatus || "?" }
      : {};
    return {
      label: i18n.message(currentLanguage, errorKey, params),
      tone: settings.lastErrorCode === "web-recording-disabled" ? "neutral" : "danger",
      code: settings.lastStatus,
    };
  }
  const views = {
    connected: ["status.connected", "success"],
    connecting: ["status.connecting", "neutral"],
    configured: ["status.configured", "success"],
    "needs-config": ["status.needsConfig", "danger"],
    disconnected: ["status.disconnected", "neutral"],
    private: ["status.private", "neutral"],
    disabled: ["status.disabled", "neutral"],
    error: ["status.error", "danger"],
  };
  const [key, tone] = views[settings.lastStatus] || views.disabled;
  return { label: i18n.message(currentLanguage, key), tone, code: settings.lastStatus };
}

function configView(port, token) {
  return isValidPort(port) && String(token || "").trim()
    ? { label: i18n.message(currentLanguage, "status.configured"), tone: "success", code: "configured" }
    : { label: i18n.message(currentLanguage, "status.needsConfig"), tone: "danger", code: "needs-config" };
}

function setTokenVisibility(visible) {
  tokenInput.type = visible ? "text" : "password";
  toggleTokenButton.dataset.visible = String(visible);
  toggleTokenButton.setAttribute("aria-label", i18n.message(currentLanguage, visible ? "options.hideToken" : "options.showToken"));
  toggleTokenButton.setAttribute("aria-pressed", String(visible));
}

function applyLanguage() {
  currentLanguage = i18n.applyDocument(currentLanguage);
  languageButton.setAttribute("aria-label", i18n.message(currentLanguage, "options.languageMenuLabel"));
  languageOptions.forEach((option) => {
    const selected = i18n.normalizeLocale(option.dataset.languageOption) === currentLanguage;
    option.setAttribute("aria-checked", String(selected));
    option.tabIndex = selected ? 0 : -1;
  });
  setTokenVisibility(tokenInput.type === "text");
}

function syncFormState({ updateStatus = true } = {}) {
  const validPort = isValidPort(portInput.value);
  const hasToken = tokenInput.value.trim().length > 0;
  testButton.disabled = !validPort || !hasToken;
  if (updateStatus && !["saving", "syncing"].includes(statusText.dataset.state)) {
    const view = configView(portInput.value, tokenInput.value);
    setStatus(view.label, view.tone, view.code);
  }
}

async function load({ resetStatus = true } = {}) {
  currentSettings = await readSettings();
  currentLanguage = currentSettings.language;
  applyLanguage();
  portInput.value = currentSettings.port;
  tokenInput.value = currentSettings.token;
  if (resetStatus) {
    const view = statusView(currentSettings);
    setStatus(view.label, view.tone, view.code);
  }
  syncFormState({ updateStatus: false });
}

async function save() {
  const port = normalizePort(portInput.value, "");
  const token = tokenInput.value.trim();
  if (!port || !token) {
    const view = configView(portInput.value, token);
    setStatus(view.label, view.tone, view.code);
    syncFormState();
    return false;
  }
  const connectionChanged = port !== currentSettings.port || token !== currentSettings.token;
  const patch = { port, token, language: currentLanguage };
  if (connectionChanged) Object.assign(patch, statusModel.statusPatch("configured"));
  await platform.storageSet(patch);
  currentSettings = { ...currentSettings, ...patch };
  const view = connectionChanged ? statusView(currentSettings) : configView(port, token);
  setStatus(view.label, view.tone, view.code);
  syncFormState({ updateStatus: false });
  return true;
}

function queueSave() {
  if (saveTimer) clearTimeout(saveTimer);
  syncFormState();
  setStatus(i18n.message(currentLanguage, "status.saving"), "neutral", "saving");
  saveTimer = window.setTimeout(() => {
    saveTimer = null;
    void save();
  }, 250);
}

function focusedLanguageOption() {
  return languageOptions.find((option) => option.tabIndex === 0) || languageOptions[0];
}

function focusLanguageOption(index) {
  const normalizedIndex = (index + languageOptions.length) % languageOptions.length;
  languageOptions.forEach((option, optionIndex) => { option.tabIndex = optionIndex === normalizedIndex ? 0 : -1; });
  languageOptions[normalizedIndex].focus();
}

function setLanguageMenuOpen(open, { restoreFocus = false } = {}) {
  languageMenu.hidden = !open;
  languageButton.setAttribute("aria-expanded", String(open));
  if (open) {
    const selectedIndex = Math.max(0, languageOptions.findIndex((option) => option.getAttribute("aria-checked") === "true"));
    focusLanguageOption(selectedIndex);
  } else if (restoreFocus) {
    languageButton.focus();
  }
}

async function selectLanguage(option) {
  currentLanguage = i18n.normalizeLocale(option.dataset.languageOption);
  await platform.storageSet({ language: currentLanguage });
  currentSettings.language = currentLanguage;
  applyLanguage();
  setLanguageMenuOpen(false, { restoreFocus: true });
  const view = statusView(currentSettings);
  setStatus(view.label, view.tone, view.code);
}

form.addEventListener("submit", (event) => { event.preventDefault(); void save(); });
portInput.addEventListener("input", queueSave);
tokenInput.addEventListener("input", queueSave);
toggleTokenButton.addEventListener("click", () => setTokenVisibility(tokenInput.type === "password"));
languageButton.addEventListener("click", () => setLanguageMenuOpen(languageMenu.hidden));
languageMenu.addEventListener("click", (event) => {
  const option = event.target.closest("[data-language-option]");
  if (option) void selectLanguage(option);
});
languageMenu.addEventListener("keydown", (event) => {
  const index = Math.max(0, languageOptions.indexOf(document.activeElement));
  if (event.key === "ArrowDown") { event.preventDefault(); focusLanguageOption(index + 1); }
  else if (event.key === "ArrowUp") { event.preventDefault(); focusLanguageOption(index - 1); }
  else if (event.key === "Home") { event.preventDefault(); focusLanguageOption(0); }
  else if (event.key === "End") { event.preventDefault(); focusLanguageOption(languageOptions.length - 1); }
  else if (event.key === "Escape") { event.preventDefault(); setLanguageMenuOpen(false, { restoreFocus: true }); }
  else if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    void selectLanguage(focusedLanguageOption());
  } else if (event.key === "Tab") setLanguageMenuOpen(false);
});
document.addEventListener("click", (event) => {
  if (!languageMenu.hidden && !event.target.closest(".language-control")) setLanguageMenuOpen(false);
});

testButton.addEventListener("click", async () => {
  if (!await save()) return;
  setStatus(i18n.message(currentLanguage, "status.connecting"), "neutral", "syncing");
  try {
    await platform.sendMessage({ type: "patina-connect-now" });
    window.setTimeout(() => void load({ resetStatus: true }), 600);
  } catch {
    setStatus(i18n.message(currentLanguage, "error.requestFailed"), "danger", "error");
  }
});

platform.onStorageChanged((changes, areaName) => {
  if (areaName !== "local") return;
  if (["port", "token", "language", "lastStatus", "lastErrorCode", "lastErrorParams", "statusSchemaVersion"]
    .some((key) => changes[key])) void load({ resetStatus: true });
});

void load();
