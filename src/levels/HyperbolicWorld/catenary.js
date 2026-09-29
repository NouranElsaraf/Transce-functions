/**
 * Hanging-chain geometry. Posts sit at x = ±span/2, height 0; the chain has a
 * fixed length. Pure functions, unit-tested.
 * @module HyperbolicWorld/catenary
 */

/** Solve 2a·sinh(span / 2a) = length for the catenary parameter a (bisection). */
export function solveA(span, length) {
  if (span >= length) return Infinity; // taut
  let lo = span / 1400;
  let hi = 1e4;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const g = 2 * mid * Math.sinh(span / (2 * mid)) - length;
    if (g > 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** The chain as y(x) with posts at height 0: y = a·cosh(x/a) − a·cosh(span/2a). */
export function chainCurve(span, length) {
  const a = solveA(span, length);
  const top = a * Math.cosh(span / (2 * a));
  return { a, f: (x) => a * Math.cosh(x / a) - top, sag: a - top };
}

/** Parabola through both posts and the chain's lowest point. */
export function parabolaFit(span, sag) {
  return (x) => sag - sag * ((2 * x) / span) ** 2;
}

/**
 * Circular arc through both posts and the chain's lowest point, as points.
 * (For deep sags the arc is more than a semicircle, so it can't be y = f(x).)
 */
export function circleArc(span, sag, n = 120) {
  const half = span / 2;
  const yc = (sag * sag - half * half) / (2 * sag);
  const r = yc - sag;
  const phi0 = Math.atan2(half, yc); // angle of each post, measured from straight down
  return Array.from({ length: n + 1 }, (_, i) => {
    const phi = -phi0 + (2 * phi0 * i) / n;
    return [r * Math.sin(phi), yc - r * Math.cos(phi)];
  });
}

/** Points spaced evenly along the chain (arc length), for drawing beads. */
export function beads(span, length, n = 36) {
  const a = solveA(span, length);
  if (!Number.isFinite(a)) {
    return Array.from({ length: n + 1 }, (_, i) => [-span / 2 + (span * i) / n, 0]);
  }
  const top = a * Math.cosh(span / (2 * a));
  return Array.from({ length: n + 1 }, (_, i) => {
    const s = -length / 2 + (length * i) / n;
    const x = a * Math.asinh(s / a);
    return [x, a * Math.cosh(x / a) - top];
  });
}
