/**
 * Small numeric helpers shared by the levels.
 * @module mathUtils
 */

export const TAU = Math.PI * 2;

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const mapRange = (v, a1, b1, a2, b2) => a2 + ((v - a1) * (b2 - a2)) / (b1 - a1);
export const approx = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol;
export const degToRad = (d) => (d * Math.PI) / 180;
export const radToDeg = (r) => (r * 180) / Math.PI;

/** Central-difference numerical derivative of f at x. */
export function derivative(f, x, h = 1e-4) {
  return (f(x + h) - f(x - h)) / (2 * h);
}

/** Slope of the secant line through (x, f(x)) and (x + h, f(x + h)). */
export function secantSlope(f, x, h) {
  return (f(x + h) - f(x)) / h;
}

/** Catenary with lowest point at (0, a): y = a·cosh(x / a). */
export const catenary = (x, a) => a * Math.cosh(x / a);

/** Smooth ease-in-out (cubic). */
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Wrap an angle into [0, 2π). */
export const wrapAngle = (a) => ((a % TAU) + TAU) % TAU;

/**
 * Human-friendly number: 1 234, 1.2 million, 3.4 billion…
 * Keeps the Growing Kingdom readable when numbers explode.
 */
export function formatBig(n) {
  const abs = Math.abs(n);
  const units = [
    [1e12, 'trillion'],
    [1e9, 'billion'],
    [1e6, 'million'],
  ];
  for (const [value, name] of units) {
    if (abs >= value) return `${(n / value).toFixed(abs >= value * 100 ? 0 : 1)} ${name}`;
  }
  return Math.round(n).toLocaleString('en-US');
}

/** Round to a number of decimals, avoiding "-0". */
export function round(v, decimals = 2) {
  const f = 10 ** decimals;
  const r = Math.round(v * f) / f;
  return Object.is(r, -0) ? 0 : r;
}

/** Deterministic pseudo-random generator (mulberry32) for reproducible puzzles. */
export function seededRandom(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
