import { reviewManifest } from "../../locales/review-manifest.ts";
import { SUPPORTED_LOCALES } from "../../locales/registry.ts";
import { localeContentHash } from "./model.ts";

const errors: string[] = [];
for (const locale of SUPPORTED_LOCALES) {
  const review = reviewManifest[locale];
  if (review.contentHash !== localeContentHash(locale)) errors.push(`${locale} review hash is stale.`);
  if (review.status !== "approved") errors.push(`${locale} still requires maintainer copy review.`);
  if (review.reviewer.startsWith("pending-") || review.reviewKind === "implementation-review-only") {
    errors.push(`${locale} does not name a completed human copy review.`);
  }
}
if (errors.length > 0) {
  console.error("Release localization approval failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("Release localization approval passed.");
