/**
 * Scoring rules: XP, combo bonus, stars and player ranks.
 *
 * Kept pure so balancing the game is a matter of editing numbers here
 * (and the unit tests tell you if you broke something).
 * @module scoring
 */

export const XP_PER_CORRECT = 10;
export const XP_LEVEL_COMPLETE = 50;
export const XP_PER_STAR = 15;
export const MAX_COMBO_BONUS = 10;

/** Extra XP for keeping a streak going: +2 per combo step, capped. */
export function comboBonus(combo) {
  return Math.min(Math.max(combo - 1, 0) * 2, MAX_COMBO_BONUS);
}

/** XP for a correct answer given the combo *after* this answer. */
export function xpForCorrect(combo) {
  return XP_PER_CORRECT + comboBonus(combo);
}

/**
 * Stars for a finished level.
 * 3★ — at most one slip and no hints. 2★ — a hint or a few slips. 1★ — you finished!
 */
export function starsFor({ mistakes = 0, hints = 0 } = {}) {
  if (mistakes <= 1 && hints === 0) return 3;
  if (mistakes <= 3 && hints <= 1) return 2;
  return 1;
}

/** XP awarded when a level is completed. */
export function xpForLevel(stars) {
  return XP_LEVEL_COMPLETE + stars * XP_PER_STAR;
}

export const RANKS = [
  { xp: 0, title: 'Curious Mind' },
  { xp: 100, title: 'Observer' },
  { xp: 250, title: 'Explorer' },
  { xp: 450, title: 'Pattern Hunter' },
  { xp: 700, title: 'Analyst' },
  { xp: 1000, title: 'Engineer' },
  { xp: 1400, title: 'Calculus Whisperer' },
];

/** Current rank, the next one, and progress (0–1) towards it. */
export function rankFor(xp) {
  let index = 0;
  RANKS.forEach((r, i) => {
    if (xp >= r.xp) index = i;
  });
  const current = RANKS[index];
  const next = RANKS[index + 1] || null;
  const progress = next ? (xp - current.xp) / (next.xp - current.xp) : 1;
  return { index, current, next, progress };
}
