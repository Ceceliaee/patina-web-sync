export interface CopyReview {
  contentHash: string;
  reviewedAt: string;
  reviewer: string;
  reviewKind: string;
  status: string;
}

export function validateCopyReview(locale: string, review: CopyReview, hash: string, release: boolean): string[] {
  const errors: string[] = [];
  if (review.contentHash !== hash) errors.push(`${locale} review hash is stale.`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(review.reviewedAt) || !review.reviewer.trim()) errors.push(`${locale} review metadata is incomplete.`);
  if (!["pending", "approved"].includes(review.status)) errors.push(`${locale} review status is invalid.`);
  const allowed = ["maintainer-copy-review", "copy-review"].includes(review.reviewKind);
  if (release || review.status === "approved") {
    if (review.status !== "approved" || !allowed || review.reviewer.startsWith("pending-")) {
      errors.push(`${locale} does not have an accepted completed copy review.`);
    }
  } else if (!["implementation-review-only", "maintainer-copy-review", "copy-review"].includes(review.reviewKind)) {
    errors.push(`${locale} review kind is invalid.`);
  }
  return errors;
}
