import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalChecksumText, compareAssetDigests } from "./release/release-policy.ts";

const REPO_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const workflow = await readFile(join(REPO_ROOT, ".github/workflows/release.yml"), "utf8");
const errors: string[] = [];
for (const required of [
  "permissions:\n  contents: read", "concurrency:", "cancel-in-progress: false",
  "node-version-file: .node-version", "actions/upload-artifact@v4", "actions/download-artifact@v4",
  "attestations: write", "id-token: write", "actions/attest-build-provenance@v3",
  "SHA256SUMS", "gh release download", "gh release upload", "npm run release:verify-assets", "gh attestation verify",
  "same-name asset hash conflict", "unexpected release asset", "Verify published release assets",
  "Release tag or title mismatch", "git rev-parse", "npm run check:i18n:release",
]) {
  if (!workflow.includes(required)) errors.push(`release.yml is missing required contract: ${required}`);
}
for (const forbidden of ["overwrite_files: true", "--clobber", "extension:firefox:sign", "workflow_dispatch:", "gh release delete", "artifact-metadata: write"]) {
  if (workflow.includes(forbidden)) errors.push(`release.yml contains forbidden release behavior: ${forbidden}`);
}

const expected = new Map([["same.zip", "aaa"], ["missing.xpi", "bbb"], ["conflict.zip", "ccc"]]);
const actual = new Map([["same.zip", "AAA"], ["conflict.zip", "ddd"]]);
const comparison = compareAssetDigests(expected, actual);
if (comparison.matching.join() !== "same.zip") errors.push("Release digest policy must recognize byte-identical assets.");
if (comparison.missing.join() !== "missing.xpi") errors.push("Release digest policy must identify missing assets.");
if (comparison.conflicts[0]?.name !== "conflict.zip") errors.push("Release digest policy must reject hash conflicts.");
if (comparison.unexpected.length !== 0) errors.push("Release digest policy reported a false unexpected asset.");

const allSame = compareAssetDigests(new Map([["a.zip", "aaa"]]), new Map([["a.zip", "AAA"]]));
if (allSame.matching.join() !== "a.zip" || allSame.missing.length || allSame.conflicts.length || allSame.unexpected.length) {
  errors.push("Release digest policy must accept an exact byte-identical rerun.");
}
const absentRelease = compareAssetDigests(new Map([["a.zip", "aaa"], ["b.xpi", "bbb"]]), new Map());
if (absentRelease.missing.join() !== "a.zip,b.xpi") errors.push("A missing release must require every expected asset.");
const unexpected = compareAssetDigests(new Map([["a.zip", "aaa"]]), new Map([["a.zip", "aaa"], ["a (1).zip", "aaa"]]));
if (unexpected.unexpected.join() !== "a (1).zip") errors.push("Release digest policy must reject near-name and unexpected assets.");

const canonical = canonicalChecksumText(new Map([["z.xpi", "BBB"], ["a.zip", "AAA"]]));
if (canonical !== "aaa  a.zip\nbbb  z.xpi\n") errors.push("SHA256SUMS must be lowercase and filename-sorted.");
for (const invalid of [
  "aaa  a.zip\n",
  "aaa  a.zip\nbbb  z.xpi\nccc  extra.zip\n",
  "bbb  z.xpi\naaa  a.zip\n",
  "aaa  a.zip\nccc  z.xpi\n",
]) {
  if (invalid === canonical) errors.push("Checksum negative fixture unexpectedly matched canonical content.");
}

const preflightIndex = workflow.indexOf("Preflight existing release assets");
const attestIndex = workflow.indexOf("Attest Chromium ZIP");
const editIndex = workflow.indexOf('gh release edit "$TAG"');
const conflictIndex = workflow.indexOf("same-name asset hash conflict");
if (!(preflightIndex >= 0 && attestIndex > preflightIndex)) errors.push("Read-only release preflight must run before attestations.");
if (!(editIndex > conflictIndex)) errors.push("Release metadata must not change before asset conflict checks pass.");

if (errors.length > 0) {
  console.error("Release workflow check failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("Release workflow immutability and recovery checks passed.");
