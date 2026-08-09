import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const CHROMIUM = join(REPO_ROOT, "src", "chromium");
const FIREFOX = join(REPO_ROOT, "src", "firefox");
const ALLOWED_DIFFERENCES = new Map([
  ["background.js", "Browser event, favicon, and Firefox optional-consent APIs differ."],
  ["manifest.json", "Permissions and background entry declarations are target-specific."],
  ["README.md", "Target installation and distribution instructions differ."],
  ["README.zh-CN.md", "Target installation and distribution instructions differ."],
] as const);

async function listFiles(root: string, prefix = ""): Promise<string[]> {
  const entries = await readdir(join(root, prefix), { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...await listFiles(root, relative));
    else if (entry.isFile()) files.push(relative);
  }
  return files.sort((left, right) => left.localeCompare(right));
}

const chromiumFiles = await listFiles(CHROMIUM);
const firefoxFiles = await listFiles(FIREFOX);
const errors: string[] = [];
for (const file of new Set([...chromiumFiles, ...firefoxFiles])) {
  if (!chromiumFiles.includes(file)) errors.push(`Chromium target is missing ${file}.`);
  if (!firefoxFiles.includes(file)) errors.push(`Firefox target is missing ${file}.`);
  if (ALLOWED_DIFFERENCES.has(file) || !chromiumFiles.includes(file) || !firefoxFiles.includes(file)) continue;
  const [chromium, firefox] = await Promise.all([
    readFile(join(CHROMIUM, file)),
    readFile(join(FIREFOX, file)),
  ]);
  if (!chromium.equals(firefox)) errors.push(`${file} differs between browser targets without an allowed platform reason.`);
}

for (const required of [
  "background-status.js", "generated/messages.js", "i18n.js", "options.html", "options.js",
  "platform.js", "popup.html", "popup.js", "_locales/en/messages.json", "_locales/zh_CN/messages.json",
]) {
  if (!chromiumFiles.includes(required) || !firefoxFiles.includes(required)) {
    errors.push(`Required shared target file is missing: ${required}.`);
  }
}

if (errors.length > 0) {
  console.error("Browser target parity check failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Browser target parity check passed for ${chromiumFiles.length} files.`);
