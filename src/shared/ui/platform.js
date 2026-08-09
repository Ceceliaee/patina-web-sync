// Target copies are generated from this shared source.
(() => {
  const promiseApi = typeof globalThis.browser !== "undefined" ? globalThis.browser : null;
  const callbackApi = typeof globalThis.chrome !== "undefined" ? globalThis.chrome : null;
  const api = promiseApi || callbackApi;
  if (!api) throw new Error("Patina Web Sync browser API is unavailable.");

  function sendMessage(message) {
    if (promiseApi) return promiseApi.runtime.sendMessage(message);
    return new Promise((resolve, reject) => {
      callbackApi.runtime.sendMessage(message, (response) => {
        const error = callbackApi.runtime.lastError;
        if (error) reject(new Error(error.message));
        else resolve(response);
      });
    });
  }

  globalThis.PatinaPlatform = Object.freeze({
    onStorageChanged(listener) { api.storage.onChanged.addListener(listener); },
    openOptionsPage() { return api.runtime.openOptionsPage(); },
    queryTabs(query) { return api.tabs.query(query); },
    sendMessage,
    storageGet(defaults) { return api.storage.local.get(defaults); },
    storageRemove(keys) { return api.storage.local.remove(keys); },
    storageSet(values) { return api.storage.local.set(values); },
  });
})();
