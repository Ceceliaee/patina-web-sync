import { reviewManifest } from "../../locales/review-manifest.ts";
import { SUPPORTED_LOCALES } from "../../locales/registry.ts";
import { localeContentHash } from "./model.ts";
import { validateCopyReview } from "./review-policy.ts";

const errors: string[] = [];
for (const locale of SUPPORTED_LOCALES) {
  const review = reviewManifest[locale];
  errors.push(...validateCopyReview(locale, review, localeContentHash(locale), true));
}
if (errors.length > 0) {
  console.error("Release localization approval failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("Release localization approval passed.");
