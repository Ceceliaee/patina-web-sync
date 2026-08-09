import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalChecksumText } from "./release/release-policy.ts";

const REPO_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const packageJson = JSON.parse(await readFile(join(REPO_ROOT, "package.json"), "utf8")) as { version: string };
const command = process.argv[2];
const directory = resolve(REPO_ROOT, process.argv[3] || "dist-release");
const version = process.argv[4] || packageJson.version;
const binaries = [
  `patina-chromium-extension-v${version}.zip`,
  `patina-firefox-extension-v${version}.xpi`,
].sort((left, right) => left.localeCompare(right));

function fail(message: string): never {
  console.error(`Release asset check failed. ${message}`);
  process.exit(1);
}

async function sha256(path: string) {
  return createHash("sha256").update(await readFile(path)).digest("hex");
}

async function checksums() {
  const digests = new Map<string, string>();
  for (const file of binaries) digests.set(file, await sha256(join(directory, file)));
  await writeFile(join(directory, "SHA256SUMS"), canonicalChecksumText(digests), "utf8");
  console.log(`Wrote SHA256SUMS for ${binaries.length} release assets.`);
}

async function verify() {
  const expectedFiles = [...binaries, "SHA256SUMS"].sort((left, right) => left.localeCompare(right));
  const actualFiles = (await readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => name !== "release-notes.md")
    .sort((left, right) => left.localeCompare(right));
  if (actualFiles.join("\0") !== expectedFiles.join("\0")) {
    fail(`Expected exactly ${expectedFiles.join(", ")}; found ${actualFiles.join(", ") || "(none)"}.`);
  }
  const checksum = await readFile(join(directory, "SHA256SUMS"), "utf8");
  const digests = new Map<string, string>();
  for (const file of binaries) digests.set(file, await sha256(join(directory, file)));
  const expected = canonicalChecksumText(digests);
  if (checksum !== expected) fail("SHA256SUMS does not match the final ZIP/XPI bytes or canonical ordering.");
  for (const file of binaries) {
    if ((await readFile(join(directory, file))).length === 0) fail(`${basename(file)} is empty.`);
  }
  console.log(`Release asset verification passed for ${version}.`);
}

if (command === "checksums") await checksums();
else if (command === "verify") await verify();
else fail(`Unknown command ${command || "(missing)"}; use checksums or verify.`);
