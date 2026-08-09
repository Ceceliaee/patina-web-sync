import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const EXPECTED_WORKFLOWS = [
  ".github/workflows/check.yml",
  ".github/workflows/release.yml",
] as const;

function fail(message: string): never {
  console.error(`Toolchain check failed. ${message}`);
  process.exit(1);
}

const nodeVersion = (await readFile(join(REPO_ROOT, ".node-version"), "utf8")).trim();
if (!/^\d+\.\d+\.\d+$/.test(nodeVersion)) {
  fail(`.node-version must contain an exact X.Y.Z version; found ${nodeVersion || "(empty)"}.`);
}

const packageJson = JSON.parse(await readFile(join(REPO_ROOT, "package.json"), "utf8")) as {
  engines?: { node?: string; npm?: string };
  devEngines?: {
    runtime?: { name?: string; version?: string; onFail?: string };
    packageManager?: { name?: string; version?: string; onFail?: string };
  };
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
};

if (packageJson.engines?.node !== nodeVersion) {
  fail(`package.json engines.node must equal ${nodeVersion}.`);
}
const npmVersion = packageJson.engines?.npm;
if (!npmVersion || !/^\d+\.\d+\.\d+$/.test(npmVersion)) {
  fail("package.json engines.npm must contain an exact X.Y.Z version.");
}
if (
  packageJson.devEngines?.runtime?.name !== "node"
  || packageJson.devEngines.runtime.version !== nodeVersion
  || packageJson.devEngines.runtime.onFail !== "error"
) {
  fail("package.json devEngines.runtime must enforce the exact .node-version value.");
}
if (
  packageJson.devEngines?.packageManager?.name !== "npm"
  || packageJson.devEngines.packageManager.version !== npmVersion
  || packageJson.devEngines.packageManager.onFail !== "error"
) {
  fail("package.json devEngines.packageManager must enforce engines.npm.");
}

const nodeTypes = packageJson.devDependencies?.["@types/node"] ?? "";
const nodeMajor = nodeVersion.split(".")[0];
if (!new RegExp(`^\\^?${nodeMajor}(?:\\.|$)`).test(nodeTypes)) {
  fail(`@types/node must use Node ${nodeMajor}; found ${nodeTypes || "(missing)"}.`);
}

for (const [name, command] of Object.entries(packageJson.scripts ?? {})) {
  if (command.includes("--experimental-strip-types")) {
    fail(`package script ${name} still uses --experimental-strip-types.`);
  }
}

for (const workflow of EXPECTED_WORKFLOWS) {
  const content = await readFile(join(REPO_ROOT, workflow), "utf8");
  if (!content.includes("node-version-file: .node-version")) {
    fail(`${workflow} must use node-version-file: .node-version.`);
  }
  if (/node-version:\s*\d/.test(content)) {
    fail(`${workflow} must not hardcode another Node version.`);
  }
}

for (const readmePath of ["README.md", "README.zh-CN.md"]) {
  const readme = await readFile(join(REPO_ROOT, readmePath), "utf8");
  const expectedNode = `[Node.js](https://nodejs.org/) ${nodeVersion}`;
  const expectedNpm = `npm ${npmVersion}`;
  if (!readme.includes(expectedNode) || !readme.includes(expectedNpm)) {
    fail(`${readmePath} must document the exact ${expectedNode} / ${expectedNpm} toolchain.`);
  }
}

console.log(`Toolchain check passed: Node ${nodeVersion}, npm ${npmVersion}.`);
