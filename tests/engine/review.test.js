import { describe, expect, it } from 'vitest';
import { approve, draftReview, editContent, publish, publishableReason, reject, ReviewError, submitForReview } from '../../src/engine/review/workflow.js';
import { filterPublishable } from '../../src/engine/catalog/published.js';
import { contentHash } from '../../src/engine/hash.js';
import { demoLesson, FULL_CHECKLIST } from '../helpers.js';

const draft = () => ({ ...demoLesson(), review: draftReview() });
const inReview = () => submitForReview(draft(), 'author');
const approved = () => approve(inReview(), { by: 'Dr. Mona', checklist: FULL_CHECKLIST, acknowledgeFlags: true });

const code = (fn) => {
  try {
    fn();
  } catch (e) {
    expect(e).toBeInstanceOf(ReviewError);
    return e.code;
  }
  return 'no-error';
};

describe('review workflow', () => {
  it('draft → in review → approved → published', () => {
    const p = publish(approved(), 'Dr. Mona');
    expect(p.review.status).toBe('published');
    expect(p.review.approvedBy).toBe('Dr. Mona');
    expect(p.review.contentHash).toBe(contentHash(p));
    expect(publishableReason(p)).toBeNull();
  });

  it('cannot approve without review, a human reviewer, a full checklist and acknowledged flags', () => {
    expect(code(() => approve(draft(), { by: 'Dr. Mona', checklist: FULL_CHECKLIST, acknowledgeFlags: true }))).toBe('bad-status');
    expect(code(() => approve(inReview(), { by: '', checklist: FULL_CHECKLIST, acknowledgeFlags: true }))).toBe('no-reviewer');
    expect(code(() => approve(inReview(), { by: 'Claude', checklist: FULL_CHECKLIST, acknowledgeFlags: true }))).toBe('no-reviewer');
    expect(code(() => approve(inReview(), { by: 'Dr. Mona', checklist: { ...FULL_CHECKLIST, narration: false }, acknowledgeFlags: true }))).toBe('checklist');
    expect(code(() => approve(inReview(), { by: 'Dr. Mona', checklist: FULL_CHECKLIST }))).toBe('flags');
  });

  it('cannot submit an invalid lesson', () => {
    const l = draft();
    l.stages[0].interaction.type = 'hologram';
    expect(code(() => submitForReview(l, 'author'))).toBe('invalid');
  });

  it('cannot publish unless approved, and never with stale content', () => {
    expect(code(() => publish(inReview(), 'x'))).toBe('not-approved');
    const a = approved();
    a.meta.tagline.ar = 'اتغيرت بعد الموافقة';
    expect(code(() => publish(a, 'x'))).toBe('stale-approval');
  });

  it('content edits invalidate approval and ignore any review block in the edit', () => {
    const a = approved();
    const changed = { ...a, meta: { ...a.meta, estimatedMinutes: 20 }, review: { status: 'published', approvedBy: 'Me', contentHash: 'fake', history: [] } };
    const e = editContent(a, changed, 'author');
    expect(e.review.status).toBe('draft');
    expect(e.review.approvedBy).toBeUndefined();
    expect(e.review.history.at(-1).note).toMatch(/approval invalidated/);
    expect(editContent(a, structuredClone(a), 'author')).toBe(a); // no-op edit keeps approval
    expect(code(() => editContent(a, { ...a, id: 'other-id' }, 'x'))).toBe('id-change');
  });

  it('reject sends it back; it can be resubmitted after fixes', () => {
    const r = reject(inReview(), { by: 'Dr. Mona', notes: 'tone' });
    expect(r.review.status).toBe('rejected');
    expect(submitForReview(r, 'author').review.status).toBe('in_review');
  });

  it('the student catalogue drops anything not properly published (tampering, drafts, invalid)', () => {
    const good = publish(approved(), 'Dr. Mona');
    const tampered = structuredClone(good);
    tampered.stages[0].body.ar = 'محتوى اتغير في الملف مباشرة';
    const forged = { ...demoLesson(), id: 'forged-lesson', review: { status: 'published', history: [] } };
    const draftOnly = { ...draft(), id: 'draft-only' };
    const { lessons, rejected } = filterPublishable([good, tampered, forged, draftOnly]);
    expect(lessons.map((l) => l.id)).toEqual(['integration-water-tank']);
    expect(rejected.map((r) => r.reason)).toEqual(['content does not match its approval', 'no recorded human approval', 'not published']);
  });
});
