import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const packageJson = JSON.parse(await readFile(join(REPO_ROOT, "package.json"), "utf8")) as { version: string };
const packages = {
  chromium: join(REPO_ROOT, "dist", "extensions", "chromium", `patina-chromium-extension-v${packageJson.version}.zip`),
  firefox: join(REPO_ROOT, "dist", "extensions", "firefox", `patina-firefox-extension-v${packageJson.version}.zip`),
};

function sha256(bytes: Buffer) { return createHash("sha256").update(bytes).digest("hex"); }

type ZipEntry = { name: string; data: Buffer };

function zipEntries(bytes: Buffer): ZipEntry[] {
  let end = -1;
  for (let index = bytes.length - 22; index >= Math.max(0, bytes.length - 65_557); index -= 1) {
    if (bytes.readUInt32LE(index) === 0x06054b50) { end = index; break; }
  }
  if (end < 0) throw new Error("ZIP end record is missing.");
  const count = bytes.readUInt16LE(end + 10);
  let offset = bytes.readUInt32LE(end + 16);
  const entries: ZipEntry[] = [];
  for (let entry = 0; entry < count; entry += 1) {
    if (bytes.readUInt32LE(offset) !== 0x02014b50) throw new Error("ZIP central directory is invalid.");
    const nameLength = bytes.readUInt16LE(offset + 28);
    const extraLength = bytes.readUInt16LE(offset + 30);
    const commentLength = bytes.readUInt16LE(offset + 32);
    const name = bytes.subarray(offset + 46, offset + 46 + nameLength).toString("utf8");
    const method = bytes.readUInt16LE(offset + 10);
    const compressedSize = bytes.readUInt32LE(offset + 20);
    const localOffset = bytes.readUInt32LE(offset + 42);
    if (method !== 0) throw new Error(`${name} must use deterministic stored ZIP entries.`);
    if (bytes.readUInt32LE(localOffset) !== 0x04034b50) throw new Error(`${name} has an invalid local ZIP header.`);
    const localNameLength = bytes.readUInt16LE(localOffset + 26);
    const localExtraLength = bytes.readUInt16LE(localOffset + 28);
    const dataOffset = localOffset + 30 + localNameLength + localExtraLength;
    entries.push({ name, data: bytes.subarray(dataOffset, dataOffset + compressedSize) });
    offset += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

async function runPackage(target: "chromium" | "firefox") {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, [join(REPO_ROOT, "scripts", `${target}-extension.ts`), "package"], {
      cwd: REPO_ROOT,
      stdio: "ignore",
    });
    child.on("error", reject);
    child.on("close", (code) => code === 0 ? resolve() : reject(new Error(`${target} packaging exited with ${code}.`)));
  });
  return readFile(packages[target]);
}

for (const target of ["chromium", "firefox"] as const) {
  const first = await runPackage(target);
  const second = await runPackage(target);
  const firstHash = sha256(first);
  const secondHash = sha256(second);
  if (firstHash !== secondHash || !first.equals(second)) {
    throw new Error(`Package determinism check failed. ${target} hashes differ: ${firstHash} vs ${secondHash}.`);
  }
  const entries = zipEntries(second);
  const files = entries.map((entry) => entry.name);
  if (!files.includes("manifest.json")) throw new Error(`${target} package must contain root manifest.json.`);
  for (const forbidden of ["node_modules/", ".git/", "docs/working/", ".map", ".secrets", "WEB_EXT_API_SECRET"]) {
    if (files.some((file) => file.includes(forbidden))) throw new Error(`${target} package contains forbidden entry: ${forbidden}`);
  }
  const expectedFiles = [
    "_locales/en/messages.json", "_locales/zh_CN/messages.json", "background-status.js", "background.js",
    "generated/messages.js", "i18n.js", "icons/icon-128.png", "icons/icon-32.png", "icons/icon-64.png",
    "manifest.json", "options.html", "options.js", "platform.js", "popup.html", "popup.js",
  ].sort((left, right) => left.localeCompare(right));
  if (files.join("\0") !== expectedFiles.join("\0")) {
    throw new Error(`${target} package file set differs from the explicit allowlist: ${files.join(", ")}.`);
  }
  const manifestEntry = entries.find((entry) => entry.name === "manifest.json");
  const manifest = JSON.parse(manifestEntry?.data.toString("utf8") || "null");
  if (manifest.version !== packageJson.version || manifest.manifest_version !== 3) {
    throw new Error(`${target} packaged manifest version contract is invalid.`);
  }
  if (target === "firefox" && (
    manifest.browser_specific_settings?.gecko?.id !== "web-sync@patina.local"
    || manifest.browser_specific_settings?.gecko?.strict_min_version !== "142.0"
  )) throw new Error("Firefox packaged Gecko identity contract is invalid.");
  const text = entries
    .filter((entry) => /\.(?:html|js|json)$/.test(entry.name))
    .map((entry) => entry.data.toString("utf8"))
    .join("\n");
  for (const [label, pattern] of [
    ["private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
    ["GitHub token", /\b(?:ghp_|github_pat_)[A-Za-z0-9_]{16,}/],
    ["AMO secret", /\bWEB_EXT_API_(?:KEY|SECRET)\b/],
    ["developer absolute path", /[A-Za-z]:\\Users\\[^\\\r\n]+/],
    ["source map", /sourceMappingURL=/],
    ["remote script", /<script[^>]+src=["']https?:\/\//i],
  ] as const) {
    if (pattern.test(text)) throw new Error(`${target} package contains forbidden ${label}.`);
  }
  console.log(`${target} package is deterministic: ${secondHash} (${files.length} files).`);
}
