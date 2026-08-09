import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { buildGeneratedOutputs, validateRegistry } from "./model.ts";

const REPO_ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const write = process.argv.includes("--write");
const errors = validateRegistry();
if (errors.length > 0) {
  console.error("Localization generation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const outputs = await buildGeneratedOutputs(REPO_ROOT);
const mismatches: string[] = [];
if (write) {
  const originals = new Map<string, string | null>();
  for (const output of outputs) {
    const path = join(REPO_ROOT, output.relativePath);
    try { originals.set(path, await readFile(path, "utf8")); } catch { originals.set(path, null); }
  }
  const touched: string[] = [];
  try {
    for (const output of outputs) {
      const path = join(REPO_ROOT, output.relativePath);
      await mkdir(dirname(path), { recursive: true });
      touched.push(path);
      await writeFile(path, output.content, "utf8");
    }
  } catch (error) {
    const rollbackErrors: string[] = [];
    for (const path of touched.reverse()) {
      try {
        const original = originals.get(path);
        if (original === null) await rm(path, { force: true });
        else await writeFile(path, original ?? "", "utf8");
      } catch (rollbackError) {
        rollbackErrors.push(`${relative(REPO_ROOT, path)}: ${String(rollbackError)}`);
      }
    }
    if (rollbackErrors.length > 0) {
      throw new Error(`Localization generation failed and rollback was incomplete:\n${rollbackErrors.join("\n")}`, { cause: error });
    }
    throw error;
  }
} else {
  for (const output of outputs) {
    const path = join(REPO_ROOT, output.relativePath);
    let actual = "";
    try { actual = await readFile(path, "utf8"); } catch { mismatches.push(`${output.relativePath} is missing.`); continue; }
    if (actual !== output.content) mismatches.push(`${output.relativePath} differs from its generated source.`);
  }
}

if (mismatches.length > 0) {
  console.error("Localization generation check failed:");
  for (const mismatch of mismatches) console.error(`- ${mismatch}`);
  console.error("Run npm run i18n:generate and commit the generated files.");
  process.exit(1);
}
console.log(write
  ? `Generated ${outputs.length} localization and shared UI files.`
  : `Localization generation check passed for ${outputs.length} files.`);
