import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const REPO_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const TARGETS = ["chromium", "firefox"] as const;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`UI accessibility check failed. ${message}`);
}

function staticContractErrors(optionsHtml: string, optionsJs: string, popupHtml: string) {
  const errors: string[] = [];
  const requireText = (source: string, expected: string, message: string) => {
    if (!source.includes(expected)) errors.push(message);
  };
  requireText(optionsHtml, 'aria-controls="language-menu"', "Language button must control the language menu.");
  requireText(optionsHtml, 'aria-haspopup="menu"', "Language button must expose menu semantics.");
  requireText(optionsHtml, 'role="menu"', "Language menu must use role=menu.");
  requireText(optionsHtml, 'role="menuitemradio"', "Language options must use menuitemradio semantics.");
  requireText(optionsHtml, 'role="status"', "Options status must expose role=status.");
  requireText(optionsHtml, 'aria-live="polite"', "Options status must be a polite live region.");
  requireText(optionsHtml, 'aria-atomic="true"', "Options status must be atomic.");
  requireText(popupHtml, 'role="status"', "Popup status must expose role=status.");
  requireText(popupHtml, 'aria-live="polite"', "Popup status must be a polite live region.");
  requireText(popupHtml, 'aria-atomic="true"', "Popup status must be atomic.");
  for (const key of ["ArrowDown", "ArrowUp", "Home", "End", "Escape", "Enter", "Tab"]) {
    requireText(optionsJs, `event.key === "${key}"`, `Language menu must handle ${key}.`);
  }
  requireText(optionsJs, 'event.key === " "', "Language menu must handle Space.");
  requireText(optionsHtml, "button:focus-visible", "Options buttons must have visible keyboard focus.");
  requireText(optionsHtml, "overflow-wrap: anywhere", "Long localized status text must wrap in narrow reflow layouts.");
  requireText(popupHtml, "button:focus-visible", "Popup buttons must have visible keyboard focus.");
  return errors;
}

type BrowserMock = {
  browser?: object;
  chrome?: object;
  writes: Array<Record<string, unknown>>;
  state: Record<string, unknown>;
};

function makeBrowserMock(target: typeof TARGETS[number], initial: Record<string, unknown>): BrowserMock {
  const state = { ...initial };
  const writes: Array<Record<string, unknown>> = [];
  const storage = {
    local: {
      async get() { return { ...state }; },
      async set(values: Record<string, unknown>) { writes.push({ ...values }); Object.assign(state, values); },
      async remove(keys: string | string[]) { for (const key of Array.isArray(keys) ? keys : [keys]) delete state[key]; },
    },
    onChanged: { addListener() {} },
  };
  const tabs = { async query() { return [{ url: "https://example.com/path?q=1#part", title: "Example", incognito: false }]; } };
  const runtimeBase = { async openOptionsPage() {} };
  if (target === "firefox") {
    return { browser: { storage, tabs, runtime: { ...runtimeBase, async sendMessage() { return { ok: true }; } } }, writes, state };
  }
  const runtime = {
    ...runtimeBase,
    lastError: null,
    sendMessage(_message: unknown, callback: (response: unknown) => void) { callback({ ok: true }); },
  };
  return { chrome: { storage, tabs, runtime }, writes, state };
}

async function flush() {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await Promise.resolve();
}

async function loadPage(target: typeof TARGETS[number], page: "options" | "popup", initial: Record<string, unknown>) {
  const root = join(REPO_ROOT, "src", target);
  const html = await readFile(join(root, `${page}.html`), "utf8");
  const dom = new JSDOM(html, {
    pretendToBeVisual: true,
    runScripts: "outside-only",
    url: `https://patina-extension.invalid/${page}.html`,
  });
  const mock = makeBrowserMock(target, initial);
  if (mock.browser) Object.defineProperty(dom.window, "browser", { value: mock.browser });
  if (mock.chrome) Object.defineProperty(dom.window, "chrome", { value: mock.chrome });
  for (const script of ["background-status.js", "generated/messages.js", "platform.js", "i18n.js", `${page}.js`]) {
    dom.window.eval(await readFile(join(root, script), "utf8"));
  }
  await flush();
  return { dom, mock };
}

function key(window: JSDOM["window"], element: Element, value: string) {
  element.dispatchEvent(new window.KeyboardEvent("keydown", { key: value, bubbles: true, cancelable: true }));
}

for (const target of TARGETS) {
  const options = await loadPage(target, "options", {
    port: "12345", token: "test-token", language: "zh-CN", lastStatus: "connected",
    lastErrorCode: "none", lastErrorParams: {}, lastSeenAt: 1, statusSchemaVersion: 1,
  });
  const document = options.dom.window.document;
  const languageButton = document.querySelector<HTMLButtonElement>("#language-button")!;
  const languageMenu = document.querySelector<HTMLElement>("#language-menu")!;
  const languageOptions = [...document.querySelectorAll<HTMLButtonElement>("[data-language-option]")];
  const status = document.querySelector<HTMLElement>("#status")!;
  assert(document.documentElement.lang === "zh-CN", `${target} Options must apply the stored locale.`);
  assert(status.getAttribute("role") === "status" && status.getAttribute("aria-live") === "polite" && status.getAttribute("aria-atomic") === "true", `${target} Options status live-region contract is incomplete.`);
  languageButton.click();
  assert(!languageMenu.hidden && languageButton.getAttribute("aria-expanded") === "true", `${target} language button must open the menu.`);
  assert(document.activeElement === languageOptions[0] && languageOptions[0].tabIndex === 0 && languageOptions[1].tabIndex === -1, `${target} menu must focus the current locale with roving tabindex.`);
  key(options.dom.window, languageOptions[0], "ArrowDown");
  assert(document.activeElement === languageOptions[1], `${target} ArrowDown must focus the next locale.`);
  key(options.dom.window, languageOptions[1], "Home");
  assert(document.activeElement === languageOptions[0], `${target} Home must focus the first locale.`);
  key(options.dom.window, languageOptions[0], "End");
  assert(document.activeElement === languageOptions[1], `${target} End must focus the last locale.`);
  key(options.dom.window, languageOptions[1], "Enter");
  await flush();
  assert(document.documentElement.lang === "en-US" && options.mock.state.language === "en-US", `${target} Enter must persist and render canonical en-US.`);
  assert(languageMenu.hidden && document.activeElement === languageButton, `${target} selection must close the menu and restore focus.`);
  assert(languageOptions[1].getAttribute("aria-checked") === "true" && languageOptions[1].tabIndex === 0, `${target} selected locale semantics must match storage.`);
  languageButton.click();
  key(options.dom.window, languageOptions[1], "Escape");
  assert(languageMenu.hidden && document.activeElement === languageButton, `${target} Escape must close and restore focus.`);
  languageButton.click();
  key(options.dom.window, languageOptions[1], "ArrowUp");
  assert(document.activeElement === languageOptions[0], `${target} ArrowUp must wrap to the previous locale.`);
  key(options.dom.window, languageOptions[0], " ");
  await flush();
  assert(document.documentElement.lang === "zh-CN" && options.mock.state.language === "zh-CN", `${target} Space must select and persist zh-CN.`);
  languageButton.click();
  key(options.dom.window, languageOptions[0], "Tab");
  assert(languageMenu.hidden, `${target} Tab must close the menu without a focus trap.`);
  languageButton.click();
  document.body.dispatchEvent(new options.dom.window.MouseEvent("click", { bubbles: true }));
  assert(languageMenu.hidden, `${target} outside click must close the menu.`);
  const toggle = document.querySelector<HTMLButtonElement>("#toggle-token")!;
  toggle.click();
  assert(toggle.getAttribute("aria-pressed") === "true" && toggle.getAttribute("aria-label"), `${target} Token visibility must synchronize pressed state and label.`);
  options.dom.window.close();

  const popup = await loadPage(target, "popup", {
    port: "12345", token: "test-token", language: "en", lastStatus: "connected",
    lastErrorCode: "none", lastErrorParams: {}, lastSeenAt: 1, statusSchemaVersion: 1,
  });
  const popupDocument = popup.dom.window.document;
  const badge = popupDocument.querySelector<HTMLElement>("#status-badge")!;
  assert(popupDocument.documentElement.lang === "en-US" && popup.mock.state.language === "en-US", `${target} Popup must migrate legacy en to en-US.`);
  assert(badge.textContent === "Synced", `${target} Popup must render the localized runtime status.`);
  assert(badge.getAttribute("role") === "status" && badge.getAttribute("aria-live") === "polite" && badge.getAttribute("aria-atomic") === "true", `${target} Popup status live-region contract is incomplete.`);
  assert(popupDocument.querySelector<HTMLButtonElement>("#send-tab")?.disabled === false, `${target} Popup sync action must remain operable for a trackable page.`);
  popup.dom.window.close();
}

const sharedOptionsHtml = await readFile(join(REPO_ROOT, "src/shared/ui/options.html"), "utf8");
const sharedOptionsJs = await readFile(join(REPO_ROOT, "src/shared/ui/options.js"), "utf8");
const sharedPopupHtml = await readFile(join(REPO_ROOT, "src/shared/ui/popup.html"), "utf8");
const staticErrors = staticContractErrors(sharedOptionsHtml, sharedOptionsJs, sharedPopupHtml);
assert(staticErrors.length === 0, staticErrors.join(" "));
assert(staticContractErrors(sharedOptionsHtml, sharedOptionsJs.replace('event.key === "ArrowDown"', 'event.key === "BROKEN"'), sharedPopupHtml).some((error) => error.includes("ArrowDown")), "Keyboard mutation self-test must fail.");
assert(staticContractErrors(sharedOptionsHtml, sharedOptionsJs, sharedPopupHtml.replace('aria-live="polite"', "")).some((error) => error.includes("Popup status")), "Live-region mutation self-test must fail.");

console.log("UI accessibility DOM and keyboard matrix passed for Chromium and Firefox.");
