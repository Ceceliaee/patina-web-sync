import { findHardcoded, staleExceptions } from "./hardcoded-lib.ts";
import { renderDefaultHtml, validateMessageSet } from "./model.ts";
import { validateCopyReview } from "./review-policy.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Localization self-test failed. ${message}`);
}

const keys = ["a", "b"];
const completedReview = { contentHash: "current", reviewedAt: "2026-09-05", reviewer: "Codex", reviewKind: "copy-review", status: "approved" };
for (const locale of ["es", "en-US", "zh-CN", "ru-RU"]) {
  assert(validateCopyReview(locale, completedReview, "current", true).length === 0, "Completed copy review must use the same policy for every locale.");
  assert(validateCopyReview(locale, { ...completedReview, reviewKind: "maintainer-copy-review" }, "current", true).length === 0, "Existing maintainer copy reviews must remain valid.");
}
for (const patch of [{ status: "pending" }, { reviewer: "" }, { reviewer: "pending-copy" }, { reviewKind: "unknown" }, { reviewKind: "implementation-review-only" }, { contentHash: "stale" }]) {
  assert(validateCopyReview("es", { ...completedReview, ...patch }, "current", true).length > 0, "Incomplete or stale release reviews must fail.");
}
assert(validateMessageSet("missing", { a: "A" }, keys).some((error) => error.includes("missing b")), "Missing keys must fail.");
assert(validateMessageSet("unknown", { a: "A", b: "B", c: "C" }, keys).some((error) => error.includes("unknown key c")), "Unknown keys must fail.");
assert(
  validateMessageSet("params", { a: "{other}", b: "B" }, keys, { a: "{name}", b: "B" })
    .some((error) => error.includes("parameters")),
  "Parameter drift must fail.",
);
assert(findHardcoded("fixture.js", 'const label = "中文";', []).length === 1, "Chinese hardcoding must fail.");
assert(findHardcoded("fixture.html", "<button>Save</button>", []).length === 1, "HTML fallback text must fail.");
const exception = { file: "fixture.html", value: "Brand", owner: "product", reason: "Brand" };
assert(findHardcoded("fixture.html", "<h1>Brand</h1>", [exception]).length === 0, "Exact exceptions must pass.");
assert(staleExceptions(new Map([["fixture.html", "<h1>Other</h1>"]]), [exception]).length === 1, "Stale exceptions must fail.");
assert(renderDefaultHtml("<p>{{popup.loading}}</p>").includes("读取中"), "Default HTML fallback must come from the locale source.");
let unknownFallbackFailed = false;
try { renderDefaultHtml("<p>{{unknown.message}}</p>"); } catch { unknownFallbackFailed = true; }
assert(unknownFallbackFailed, "Unknown default HTML fallback tokens must fail.");
console.log("Localization self-tests passed.");
