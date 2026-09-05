import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { reviewManifest } from "../../locales/review-manifest.ts";
import { SUPPORTED_LOCALES } from "../../locales/registry.ts";
import { buildGeneratedOutputs, localeContentHash, validateRegistry } from "./model.ts";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { validateCopyReview } from "./review-policy.ts";

const REPO_ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const errors = validateRegistry();
for (const locale of SUPPORTED_LOCALES) {
  const review = reviewManifest[locale];
  const actualHash = localeContentHash(locale);
  errors.push(...validateCopyReview(locale, review, actualHash, false));
}

for (const output of await buildGeneratedOutputs(REPO_ROOT)) {
  let actual = "";
  try { actual = await readFile(join(REPO_ROOT, output.relativePath), "utf8"); }
  catch { errors.push(`${output.relativePath} is missing.`); continue; }
  if (actual !== output.content) errors.push(`${output.relativePath} differs from generated output.`);
}

if (errors.length > 0) {
  console.error("Localization check failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("Localization schema, review, and generated output checks passed.");
