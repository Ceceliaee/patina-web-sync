export const UI_MESSAGE_KEYS = [
  "options.headerDescription", "options.serviceTitle", "options.portLabel", "options.tokenLabel",
  "options.syncButton", "options.saveButton", "options.syncContentTitle", "options.syncContentText",
  "options.languageMenuLabel", "options.showToken", "options.hideToken", "popup.currentPageLabel",
  "popup.loading", "popup.loadingTitle", "popup.noActivePage", "popup.httpOnly", "popup.settings",
  "popup.completeSetup", "popup.syncCurrentPage", "popup.privateBadge", "popup.privateHelp",
  "status.disabled", "status.disconnected", "status.connected", "status.connecting",
  "status.needsConfig", "status.configured", "status.private", "status.saving", "status.error",
  "error.invalidToken", "error.missingToken", "error.webRecordingDisabled", "error.httpError",
  "error.invalidResponse", "error.serviceRejected", "error.requestFailed", "error.unknownService",
] as const;

export const MANIFEST_MESSAGE_KEYS = ["extensionName", "extensionDescription", "storeShortDescription"] as const;
export type UiMessageKey = typeof UI_MESSAGE_KEYS[number];
export type ManifestMessageKey = typeof MANIFEST_MESSAGE_KEYS[number];
export type UiMessages = Record<UiMessageKey, string>;
export type ManifestMessages = Record<ManifestMessageKey, string>;
