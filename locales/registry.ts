import { manifest as enManifest } from "./en-US/manifest.ts";
import { ui as enUi } from "./en-US/ui.ts";
import { manifest as esManifest } from "./es/manifest.ts";
import { ui as esUi } from "./es/ui.ts";
import { manifest as zhManifest } from "./zh-CN/manifest.ts";
import { ui as zhUi } from "./zh-CN/ui.ts";

export const DEFAULT_LOCALE = "zh-CN" as const;
export const SUPPORTED_LOCALES = ["zh-CN", "en-US", "es"] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];
export const localeRegistry = {
  "zh-CN": { displayName: "简体中文", webExtensionLocale: "zh_CN", ui: zhUi, manifest: zhManifest },
  "en-US": { displayName: "English", webExtensionLocale: "en", ui: enUi, manifest: enManifest },
  "es": { displayName: "Español", webExtensionLocale: "es", ui: esUi, manifest: esManifest },
} as const;
