import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:\.\d+)?$/;

function fail(message: string): never {
  console.error(`Release notes generation failed. ${message}`);
  process.exit(1);
}

const packageJson = JSON.parse(await readFile(join(REPO_ROOT, "package.json"), "utf8")) as { version?: unknown };
const requestedVersion = process.argv[2]?.trim().replace(/^v/, "");
const version = requestedVersion || (typeof packageJson.version === "string" ? packageJson.version.trim() : "");
if (!VERSION_PATTERN.test(version)) {
  fail(`Expected a numeric X.Y.Z or X.Y.Z.N version; found ${version || "(missing)"}.`);
}

const changelog = await readFile(join(REPO_ROOT, "CHANGELOG.md"), "utf8");
const headingPattern = new RegExp(`^## \\[${version.replaceAll(".", "\\.")}\\] - \\d{4}-\\d{2}-\\d{2}\\s*$`, "m");
const headingMatch = headingPattern.exec(changelog);
if (!headingMatch) {
  fail(`CHANGELOG.md is missing a formal [${version}] version section.`);
}

const bodyStart = headingMatch.index + headingMatch[0].length;
const nextVersionStart = changelog.indexOf("\n## [", bodyStart);
const releaseNotes = changelog.slice(bodyStart, nextVersionStart === -1 ? undefined : nextVersionStart).trim();
if (!releaseNotes.startsWith("Release:")) {
  fail(`The [${version}] version section must start with a Release: summary.`);
}

const outputPath = join(REPO_ROOT, "dist", "release-notes.md");
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${releaseNotes}\n`, "utf8");
console.log(`Release notes written to ${outputPath.slice(REPO_ROOT.length + 1)}.`);
