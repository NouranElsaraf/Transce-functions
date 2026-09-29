import { describe, expect, it } from 'vitest';
import { ACHIEVEMENTS, newlyUnlocked } from '../src/core/achievements.js';
import { initialState } from '../src/core/gameReducer.js';

describe('achievements', () => {
  it('have unique ids', () => {
    const ids = ACHIEVEMENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('nothing is unlocked on a fresh save', () => {
    expect(newlyUnlocked(initialState, ['a'])).toEqual([]);
  });

  it('unlocks first insight and ignores already-unlocked ones', () => {
    const s = { ...initialState, stats: { ...initialState.stats, correct: 1 } };
    expect(newlyUnlocked(s, []).map((a) => a.id)).toContain('first-insight');
    const s2 = { ...s, achievements: { 'first-insight': 1 } };
    expect(newlyUnlocked(s2, []).map((a) => a.id)).not.toContain('first-insight');
  });

  it('perfectionist needs 3 stars on every level', () => {
    const levels = { a: { bestStars: 3 }, b: { bestStars: 2 } };
    const s = { ...initialState, levels };
    expect(newlyUnlocked(s, ['a', 'b']).map((a) => a.id)).not.toContain('perfectionist');
    const s2 = { ...s, levels: { ...levels, b: { bestStars: 3 } } };
    expect(newlyUnlocked(s2, ['a', 'b']).map((a) => a.id)).toContain('perfectionist');
  });
});
