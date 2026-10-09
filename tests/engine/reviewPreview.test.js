import { describe, expect, it } from 'vitest';
import { filterReviewable, loadReviewPreviewLessons, REVIEW_PREVIEW } from '../../src/engine/catalog/reviewPreview.js';
import { demoLesson } from '../helpers.js';

describe('review-preview catalogue', () => {
  it('is off unless the build sets VITE_REVIEW_PREVIEW=1', () => {
    expect(REVIEW_PREVIEW).toBe(false);
    expect(loadReviewPreviewLessons()).toEqual([]);
  });
  it('only offers valid lessons that are in review or approved', () => {
    const at = (status) => ({ ...demoLesson(), review: { status, history: [] } });
    const broken = at('in_review');
    broken.stages[0].interaction.type = 'hologram';
    expect(filterReviewable([at('draft'), at('in_review'), at('approved'), at('rejected'), broken]).map((l) => l.review.status)).toEqual(['in_review', 'approved']);
  });
});
