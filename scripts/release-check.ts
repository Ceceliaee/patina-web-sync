import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const packageJson = JSON.parse(await readFile(join(REPO_ROOT, "package.json"), "utf8")) as { version: string };
const version = (process.argv[2] || packageJson.version).replace(/^v/, "");
if (!/^\d+\.\d+\.\d+(?:\.\d+)?$/.test(version)) {
  console.error(`Release check failed. Invalid candidate version: ${version || "(missing)"}.`);
  process.exit(1);
}

const npmCli = process.env.npm_execpath;
if (!npmCli) {
  console.error("Release check failed. Run this command through npm run release:check.");
  process.exit(1);
}

for (const args of [
  ["run", "check:versions", "--", version],
  ["run", "check"],
  ["run", "release:notes:candidate", "--", version],
  ["run", "extension:chromium:package"],
  ["run", "extension:firefox:package"],
  ["run", "check:package-determinism"],
]) {
  const result = spawnSync(process.execPath, [npmCli, ...args], { cwd: REPO_ROOT, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log(`Local release candidate check passed for ${version}.`);
