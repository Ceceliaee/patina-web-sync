import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { findHardcoded, staleExceptions, type HardcodedException } from "./hardcoded-lib.ts";

const REPO_ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const files = [
  "src/shared/background-status.js", "src/shared/ui/platform.js", "src/shared/ui/i18n.js",
  "src/shared/ui/options.html", "src/shared/ui/options.js", "src/shared/ui/popup.html", "src/shared/ui/popup.js",
  "src/chromium/background.js", "src/firefox/background.js",
];
const exceptions: HardcodedException[] = [
  { file: "src/shared/background-status.js", value: "无效", owner: "storage-migration", reason: "Recognizes one retired localized status fragment without displaying it." },
  { file: "src/shared/background-status.js", value: "请填写 token", owner: "storage-migration", reason: "Recognizes retired v0.2.0 storage during one-way migration." },
  { file: "src/shared/background-status.js", value: "网页同步未开启", owner: "storage-migration", reason: "Recognizes retired v0.2.0 storage during one-way migration." },
  { file: "src/shared/ui/options.html", value: "Patina Web Sync", owner: "product", reason: "Stable brand name." },
  { file: "src/shared/ui/popup.html", value: "Patina Web Sync", owner: "product", reason: "Stable brand name." },
];
const contents = new Map<string, string>();
for (const file of files) contents.set(file, await readFile(join(REPO_ROOT, file), "utf8"));
const findings = [
  ...files.flatMap((file) => findHardcoded(file, contents.get(file) ?? "", exceptions)),
  ...staleExceptions(contents, exceptions),
];
if (findings.length > 0) {
  console.error("Hardcoded localization check failed:");
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}
console.log("Hardcoded localization check passed.");
