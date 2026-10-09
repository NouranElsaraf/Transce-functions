/**
 * Review-preview catalogue — ONLY in builds made with VITE_REVIEW_PREVIEW=1
 * (`npm run build:review`). It bundles working copies from content/lessons/
 * that are valid and awaiting review (in_review / approved) so reviewers can
 * try them from a shareable static link. They render in preview mode (banner,
 * no progress) and never pass through the student publishing gate.
 *
 * In normal builds the condition is a compile-time `false`, so no unpublished
 * lesson is bundled (a test checks the production bundle).
 * @module engine/catalog/reviewPreview
 */
import { validateLesson } from '../schema/lessonSchema.js';

export const REVIEW_PREVIEW = import.meta.env.VITE_REVIEW_PREVIEW === '1';

const files = REVIEW_PREVIEW ? import.meta.glob('../../../content/lessons/*.json', { eager: true, import: 'default' }) : {};

/** Pure: lessons eligible for a review preview. */
export function filterReviewable(candidates) {
  return candidates.filter((l) => ['in_review', 'approved'].includes(l?.review?.status) && validateLesson(l).ok);
}

export function loadReviewPreviewLessons() {
  return REVIEW_PREVIEW ? filterReviewable(Object.values(files)) : [];
}
