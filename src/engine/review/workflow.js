/**
 * Review workflow — the single place that decides what a lesson's review
 * status may become. The server store calls these functions for every write,
 * and the student-facing loader calls `isPublishable` on every read, so a
 * lesson can only reach students through draft → in_review → approved →
 * published with a human reviewer and an approval bound to the exact content.
 *
 * All functions are pure: they return a new lesson or throw a ReviewError.
 * @module engine/review/workflow
 */
import { contentHash } from '../hash.js';
import { REVIEW_CHECKLIST, validateLesson } from '../schema/lessonSchema.js';

export class ReviewError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'ReviewError';
    this.code = code;
  }
}

const now = () => new Date().toISOString();

function withHistory(review, action, by, note) {
  return [...(review?.history ?? []), { at: now(), action, by: by || 'system', ...(note ? { note } : {}) }];
}

/** A fresh draft review block (used for imports, generations and edits). */
export function draftReview(history = [], note) {
  return { status: 'draft', history: [...history, { at: now(), action: 'draft', by: 'system', ...(note ? { note } : {}) }] };
}

/**
 * Replace a lesson's content. Any incoming `review` block is ignored — status
 * can only change through this module — and an existing approval is dropped.
 */
export function editContent(lesson, next, by) {
  const { review: _ignored, ...content } = next;
  if (content.id !== lesson.id) throw new ReviewError('id-change', 'The lesson id cannot change.');
  const wasApproved = ['approved', 'published'].includes(lesson.review?.status);
  const changed = contentHash(content) !== contentHash(lesson);
  if (!changed) return lesson;
  return {
    ...content,
    review: {
      status: 'draft',
      history: withHistory(lesson.review, 'edited', by, wasApproved ? 'content changed — approval invalidated' : undefined),
    },
  };
}

export function submitForReview(lesson, by) {
  if (!['draft', 'rejected'].includes(lesson.review?.status)) throw new ReviewError('bad-status', `Cannot submit a lesson that is "${lesson.review?.status}".`);
  const report = validateLesson(lesson);
  if (!report.ok) throw new ReviewError('invalid', `Fix ${report.errors.length} validation error(s) before review.`);
  return { ...lesson, review: { status: 'in_review', history: withHistory(lesson.review, 'submitted', by) } };
}

/**
 * Approve: needs a named human reviewer, a passing validation, every checklist
 * item ticked, and explicit acknowledgement of warnings/flags. Binds the
 * approval to the current content hash.
 */
export function approve(lesson, { by, checklist = {}, acknowledgeFlags = false, notes } = {}) {
  if (lesson.review?.status !== 'in_review') throw new ReviewError('bad-status', 'Only lessons in review can be approved.');
  if (typeof by !== 'string' || by.trim().length < 2) throw new ReviewError('no-reviewer', 'A named human reviewer is required.');
  if (/^(ai|bot|system|auto|claude|gpt)\b/i.test(by.trim())) throw new ReviewError('no-reviewer', 'Approval must come from a human reviewer.');
  const report = validateLesson(lesson);
  if (!report.ok) throw new ReviewError('invalid', 'The lesson no longer validates.');
  const missing = REVIEW_CHECKLIST.filter((k) => checklist[k] !== true);
  if (missing.length) throw new ReviewError('checklist', `Review checklist incomplete: ${missing.join(', ')}.`);
  if (report.warnings.length && !acknowledgeFlags) throw new ReviewError('flags', `${report.warnings.length} warning(s) must be acknowledged.`);
  return {
    ...lesson,
    review: {
      status: 'approved',
      contentHash: contentHash(lesson),
      approvedBy: by.trim(),
      approvedAt: now(),
      flagsAcknowledged: report.warnings.length > 0,
      checklist: Object.fromEntries(REVIEW_CHECKLIST.map((k) => [k, true])),
      ...(notes ? { notes: String(notes).slice(0, 1000) } : {}),
      history: withHistory(lesson.review, 'approved', by.trim(), notes),
    },
  };
}

export function reject(lesson, { by, notes } = {}) {
  if (!['in_review', 'approved'].includes(lesson.review?.status)) throw new ReviewError('bad-status', 'Only lessons in review or approved can be rejected.');
  return { ...lesson, review: { status: 'rejected', history: withHistory(lesson.review, 'rejected', by, notes) } };
}

/** Publish: only an approved lesson whose content still matches its approval. */
export function publish(lesson, by) {
  const rv = lesson.review;
  if (rv?.status !== 'approved') throw new ReviewError('not-approved', 'Only approved lessons can be published.');
  if (rv.contentHash !== contentHash(lesson)) throw new ReviewError('stale-approval', 'Content changed after approval — review again.');
  if (!validateLesson(lesson).ok) throw new ReviewError('invalid', 'The lesson no longer validates.');
  return { ...lesson, review: { ...rv, status: 'published', publishedAt: now(), history: withHistory(rv, 'published', by) } };
}

/** Read-side gate used by the student catalogue. */
export function publishableReason(lesson) {
  const rv = lesson?.review;
  if (!rv || rv.status !== 'published') return 'not published';
  if (!rv.approvedBy || !rv.approvedAt) return 'no recorded human approval';
  if (rv.contentHash !== contentHash(lesson)) return 'content does not match its approval';
  const report = validateLesson(lesson);
  if (!report.ok) return `invalid: ${report.errors[0].path} ${report.errors[0].message}`;
  return null;
}

export const isPublishable = (lesson) => publishableReason(lesson) === null;
