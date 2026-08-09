// Target copies are generated from this shared source.
(() => {
  const catalog = globalThis.PatinaLocaleCatalog;
  if (!catalog) throw new Error("Patina Web Sync locale catalog is unavailable.");

  function normalizeLocale(locale) {
    const value = String(locale || "").trim();
    if (value === "en") return "en-US";
    return Object.hasOwn(catalog.messages, value) ? value : catalog.defaultLocale;
  }

  function message(locale, key, params = {}) {
    const normalized = normalizeLocale(locale);
    const template = catalog.messages[normalized]?.[key];
    if (typeof template !== "string") throw new Error(`Missing locale message: ${normalized}/${key}`);
    return template.replace(/\{([A-Za-z][A-Za-z0-9]*)\}/g, (_match, name) => {
      if (!Object.hasOwn(params, name)) throw new Error(`Missing message parameter: ${key}/{${name}}`);
      return String(params[name]);
    });
  }

  function applyDocument(locale, root = document) {
    const normalized = normalizeLocale(locale);
    root.documentElement.lang = normalized;
    root.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = message(normalized, node.dataset.i18n);
    });
    for (const [attribute, datasetKey] of [
      ["aria-label", "i18nAriaLabel"], ["title", "i18nTitle"], ["placeholder", "i18nPlaceholder"],
    ]) {
      const dataAttribute = datasetKey.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
      root.querySelectorAll(`[data-${dataAttribute}]`).forEach((node) => {
        node.setAttribute(attribute, message(normalized, node.dataset[datasetKey]));
      });
    }
    root.querySelectorAll("[data-language-option]").forEach((node) => {
      const optionLocale = normalizeLocale(node.dataset.languageOption);
      node.textContent = catalog.displayNames[optionLocale];
      node.setAttribute("lang", optionLocale);
    });
    return normalized;
  }

  globalThis.PatinaI18n = Object.freeze({
    applyDocument, displayNames: catalog.displayNames, message, normalizeLocale,
  });
})();
