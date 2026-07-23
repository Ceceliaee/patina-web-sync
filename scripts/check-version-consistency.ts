import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const BROWSER_VERSION_PATTERN = /^\d+\.\d+\.\d+(?:\.\d+)?$/;

type JsonObject = Record<string, unknown>;

type VersionSource = {
  label: string;
  path: string;
  version: string;
};

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

async function readJson(relativePath: string) {
  const absolutePath = join(REPO_ROOT, relativePath);
  let raw = "";
  try {
    raw = await readFile(absolutePath, "utf8");
  } catch {
    fail(`Version check failed. Missing ${relativePath}.`);
  }

  try {
    return JSON.parse(raw) as JsonObject;
  } catch (error) {
    fail(`Version check failed. ${relativePath} is invalid JSON: ${String(error)}`);
  }
}

function getStringVersion(label: string, relativePath: string, json: JsonObject) {
  const version = typeof json.version === "string" ? json.version.trim() : "";
  if (!version) {
    fail(`Version check failed. ${label} version is required in ${relativePath}.`);
  }
  return version;
}

function normalizeExpectedVersion(raw: string | undefined) {
  const value = raw?.trim().replace(/^v/, "") ?? "";
  return value || undefined;
}

function describeSources(sources: VersionSource[]) {
  return sources.map((source) => `- ${source.label}: ${source.version} (${source.path})`).join("\n");
}

const expectedVersion = normalizeExpectedVersion(process.argv[2]);
const packagePath = "package.json";
const chromiumPath = "src/chromium/manifest.json";
const firefoxPath = "src/firefox/manifest.json";

const packageJson = await readJson(packagePath);
const chromiumManifest = await readJson(chromiumPath);
const firefoxManifest = await readJson(firefoxPath);

const sources: VersionSource[] = [
  {
    label: "package",
    path: packagePath,
    version: getStringVersion("package", packagePath, packageJson),
  },
  {
    label: "chromium manifest",
    path: chromiumPath,
    version: getStringVersion("Chromium manifest", chromiumPath, chromiumManifest),
  },
  {
    label: "firefox manifest",
    path: firefoxPath,
    version: getStringVersion("Firefox manifest", firefoxPath, firefoxManifest),
  },
];

const versions = new Set(sources.map((source) => source.version));
if (versions.size !== 1) {
  fail(`Version check failed. Version sources must match.\n${describeSources(sources)}`);
}

const version = sources[0]?.version ?? "";
if (!BROWSER_VERSION_PATTERN.test(version)) {
  fail(`Version check failed. Browser extension versions must use numeric X.Y.Z or X.Y.Z.N format. Found ${version}.`);
}

if (expectedVersion && version !== expectedVersion) {
  fail(`Version check failed. Release version ${expectedVersion} does not match repository version ${version}.`);
}

const engines = packageJson.engines;
if (
  typeof engines !== "object"
  || engines === null
  || Array.isArray(engines)
  || (engines as JsonObject).node !== ">=20.0.0"
  || (engines as JsonObject).npm !== ">=8.0.0"
) {
  fail("Version check failed. package.json engines must require Node.js >=20.0.0 and npm >=8.0.0.");
}

for (const readmePath of ["README.md", "README.zh-CN.md"]) {
  const readme = await readFile(join(REPO_ROOT, readmePath), "utf8");
  if (!readme.includes("[Node.js](https://nodejs.org/) 20+") || !readme.includes("npm 8+")) {
    fail(`Version check failed. ${readmePath} must document the supported Node.js 20+ and npm 8+ toolchain.`);
  }
}

console.log(`Version consistency check passed: ${version}.`);
