/**
 * Vault state shared by the Escape Room's steps: the code digits (e ≈ 2.7182…)
 * and a clock started when Lock 1 opens its screen.
 * @module EscapeRoom/vault
 */
export const CODE = ['2', '7', '1', '8', '2'];

let startedAt = null;
const solved = new Set();

/** Called when Lock 1 appears: a fresh attempt. */
export function startClock() {
  startedAt = Date.now();
  solved.clear();
}

/** Record that lock `index` was genuinely solved during this attempt. */
export function markSolved(index) {
  solved.add(index);
}

/** Elapsed escape time as "m:ss" — only for a full, honest run (null otherwise). */
export function elapsed() {
  if (!startedAt || solved.size < CODE.length) return null;
  const s = Math.round((Date.now() - startedAt) / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
