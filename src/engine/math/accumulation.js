/**
 * Accumulation maths for flow-rate lessons: a piecewise-linear flow rate Q(t),
 * its exact integral, rectangle (Riemann) sums and a tank model with explicit
 * overflow. Pure functions, unit-tested.
 *
 * Units (by convention across the engine): t in minutes, Q in litres/minute,
 * volumes in litres.
 * @module engine/math/accumulation
 */

/**
 * A flow profile is an array of [t, Q] knots with strictly increasing t and Q ≥ 0.
 * Between knots Q varies linearly; outside the knots Q is 0 (the tap is closed).
 * @typedef {Array<[number, number]>} FlowProfile
 */

/** Throw a RangeError unless `profile` is a valid flow profile. */
export function assertProfile(profile, { allowNegative = false } = {}) {
  if (!Array.isArray(profile) || profile.length < 2) throw new RangeError('A flow profile needs at least two points.');
  profile.forEach((p, i) => {
    if (!Array.isArray(p) || p.length !== 2 || !p.every(Number.isFinite)) throw new RangeError(`Point ${i} must be [t, Q] numbers.`);
    if (!allowNegative && p[1] < 0) throw new RangeError(`Flow rate at point ${i} is negative (${p[1]} L/min).`);
    if (i > 0 && p[0] <= profile[i - 1][0]) throw new RangeError(`Times must increase (point ${i}).`);
  });
  return profile;
}

/** Q(t) in L/min (linear interpolation; 0 outside the profile's time range). */
export function flowAt(profile, t) {
  const n = profile.length;
  if (t < profile[0][0] || t > profile[n - 1][0]) return 0;
  for (let i = 1; i < n; i++) {
    const [t1, q1] = profile[i];
    if (t <= t1) {
      const [t0, q0] = profile[i - 1];
      return q0 + ((q1 - q0) * (t - t0)) / (t1 - t0);
    }
  }
  return profile[n - 1][1];
}

/** Exact ∫ₐᵇ Q(t) dt in litres (trapezoids are exact for piecewise-linear Q). */
export function exactVolume(profile, a, b) {
  if (b < a) return -exactVolume(profile, b, a);
  const cuts = [a, ...profile.map((p) => p[0]).filter((t) => t > a && t < b), b];
  let total = 0;
  for (let i = 1; i < cuts.length; i++) {
    const t0 = cuts[i - 1];
    const t1 = cuts[i];
    total += ((flowAt(profile, t0) + flowAt(profile, t1)) / 2) * (t1 - t0);
  }
  return total;
}

/**
 * Rectangle (Riemann) sum of Q over [a, b] with n equal intervals.
 * @param {'left'|'right'|'midpoint'} method sample point in each interval
 * @returns {{ sum: number, width: number, rects: Array<{t0:number,t1:number,height:number}> }}
 */
export function riemannSum(profile, a, b, n, method = 'left') {
  if (!Number.isInteger(n) || n < 1) throw new RangeError('n must be a positive integer.');
  if (!['left', 'right', 'midpoint'].includes(method)) throw new RangeError(`Unknown method "${method}".`);
  const width = (b - a) / n;
  const offset = method === 'left' ? 0 : method === 'right' ? 1 : 0.5;
  const rects = [];
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const t0 = a + i * width;
    const height = flowAt(profile, t0 + offset * width);
    rects.push({ t0, t1: t0 + width, height });
    sum += height * width;
  }
  return { sum, width, rects };
}

/**
 * Tank state at time t: V(t) = V₀ + ∫₀ᵗ Q, with explicit overflow.
 * When the tank is full, extra water leaves through the overflow pipe and is
 * counted in `spilled` (litres) instead of disappearing.
 */
export function tankAt(profile, { initialVolume, capacity, t, start = profile[0][0] }) {
  if (!(initialVolume >= 0) || !(capacity > 0) || initialVolume > capacity) {
    throw new RangeError('Need 0 ≤ initial volume ≤ capacity.');
  }
  const added = exactVolume(profile, start, t);
  const unbounded = initialVolume + added;
  const volume = Math.min(unbounded, capacity);
  return {
    volume,
    added,
    spilled: Math.max(0, unbounded - capacity),
    full: unbounded >= capacity,
    level: volume / capacity,
    rate: flowAt(profile, t),
  };
}

/** First time (min) the tank fills, or null if it never does within the profile. */
export function timeToFill(profile, { initialVolume, capacity }) {
  const need = capacity - initialVolume;
  if (need <= 0) return profile[0][0];
  const start = profile[0][0];
  for (let i = 1; i < profile.length; i++) {
    const [t0] = profile[i - 1];
    const [t1] = profile[i];
    const before = exactVolume(profile, start, t0);
    const segment = exactVolume(profile, t0, t1);
    if (before + segment >= need) {
      // Solve the quadratic of a linear-rate segment by bisection (robust, ~1e-9 min).
      let lo = t0;
      let hi = t1;
      for (let k = 0; k < 80; k++) {
        const mid = (lo + hi) / 2;
        if (before + exactVolume(profile, t0, mid) >= need) hi = mid;
        else lo = mid;
      }
      return hi;
    }
  }
  return null;
}

/** Linear ramp profile Q(t) from q0 to q1 over [0, duration]. */
export const rampProfile = (q0, q1, duration) => [
  [0, q0],
  [duration, q1],
];
