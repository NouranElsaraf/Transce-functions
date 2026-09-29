import { describe, expect, it } from 'vitest';
import { comboBonus, rankFor, starsFor, xpForCorrect, xpForLevel, RANKS } from '../src/core/scoring.js';

describe('scoring', () => {
  it('gives no combo bonus for the first answer and caps it', () => {
    expect(comboBonus(1)).toBe(0);
    expect(comboBonus(2)).toBe(2);
    expect(comboBonus(100)).toBe(10);
    expect(xpForCorrect(1)).toBe(10);
  });

  it('awards stars based on slips and hints', () => {
    expect(starsFor({ mistakes: 0, hints: 0 })).toBe(3);
    expect(starsFor({ mistakes: 1, hints: 0 })).toBe(3);
    expect(starsFor({ mistakes: 2, hints: 0 })).toBe(2);
    expect(starsFor({ mistakes: 0, hints: 1 })).toBe(2);
    expect(starsFor({ mistakes: 5, hints: 0 })).toBe(1);
    expect(starsFor({ mistakes: 0, hints: 3 })).toBe(1);
  });

  it('more stars means more level XP', () => {
    expect(xpForLevel(3)).toBeGreaterThan(xpForLevel(1));
  });

  it('computes rank and progress', () => {
    expect(rankFor(0).current.title).toBe(RANKS[0].title);
    const r = rankFor(175);
    expect(r.current.xp).toBe(100);
    expect(r.progress).toBeCloseTo(0.5);
    expect(rankFor(99999).next).toBeNull();
  });
});
