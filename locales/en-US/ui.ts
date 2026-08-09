import type { UiMessages } from "../schema.ts";

export const ui = {
  "options.headerDescription": "Sync the active webpage to local Patina to complete desktop time records.",
  "options.serviceTitle": "Web Sync", "options.portLabel": "Port", "options.tokenLabel": "Token",
  "options.syncButton": "Sync current page", "options.saveButton": "Save",
  "options.syncContentTitle": "Synced data",
  "options.syncContentText": "Syncs the active website address, title, and site icon.",
  "options.languageMenuLabel": "Language", "options.showToken": "Show Token", "options.hideToken": "Hide Token",
  "popup.currentPageLabel": "Current page", "popup.loading": "Loading", "popup.loadingTitle": "Loading…",
  "popup.noActivePage": "No active webpage", "popup.httpOnly": "Only regular webpages are supported (http/https)",
  "popup.settings": "Settings", "popup.completeSetup": "Finish setup", "popup.syncCurrentPage": "Sync current page",
  "popup.privateBadge": "Private", "popup.privateHelp": "Private windows are not synced", "status.disabled": "Off",
  "status.disconnected": "No page", "status.connected": "Synced", "status.connecting": "Syncing",
  "status.needsConfig": "Needs setup", "status.configured": "Pending",
  "status.private": "Private windows are not synced", "status.saving": "Saving", "status.error": "Not synced",
  "error.invalidToken": "The Token is invalid. Copy it again from Patina Settings.",
  "error.missingToken": "Enter a Token.", "error.webRecordingDisabled": "Patina Web Sync is off.",
  "error.httpError": "Patina could not complete the sync (HTTP {httpStatus}).",
  "error.invalidResponse": "Patina returned an unrecognized response.",
  "error.serviceRejected": "Patina rejected this sync.",
  "error.requestFailed": "Could not reach local Patina. Check the app and port.",
  "error.unknownService": "Could not sync right now. Try again shortly.",
} satisfies UiMessages;
