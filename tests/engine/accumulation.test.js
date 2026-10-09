import { describe, expect, it } from 'vitest';
import { assertProfile, exactVolume, flowAt, riemannSum, tankAt, timeToFill } from '../../src/engine/math/accumulation.js';
import { compute, fillTemplate, pickValues } from '../../src/engine/math/compute.js';

const P = [
  [0, 20],
  [3, 50],
  [6, 50],
  [10, 10],
]; // L/min over minutes

describe('flow rate Q(t) [L/min]', () => {
  it('interpolates linearly and is 0 outside the profile', () => {
    expect(flowAt(P, 0)).toBe(20);
    expect(flowAt(P, 1.5)).toBe(35);
    expect(flowAt(P, 4)).toBe(50);
    expect(flowAt(P, 8)).toBe(30);
    expect(flowAt(P, -1)).toBe(0);
    expect(flowAt(P, 11)).toBe(0);
  });

  it('rejects negative flow, unordered times and malformed points', () => {
    expect(() => assertProfile([[0, 5], [1, -2]])).toThrow(/negative/);
    expect(() => assertProfile([[0, 5], [0, 6]])).toThrow(/increase/);
    expect(() => assertProfile([[0, 5]])).toThrow(/two points/);
    expect(() => assertProfile([[0, 'x'], [1, 2]])).toThrow();
    expect(() => assertProfile([[0, 1], [1, -1]], { allowNegative: true })).not.toThrow();
  });
});

describe('exact volume = ∫Q dt [L]', () => {
  it('matches hand-computed trapezoids: 105 + 150 + 120 = 375 L', () => {
    expect(exactVolume(P, 0, 3)).toBeCloseTo(105, 10);
    expect(exactVolume(P, 3, 6)).toBeCloseTo(150, 10);
    expect(exactVolume(P, 6, 10)).toBeCloseTo(120, 10);
    expect(exactVolume(P, 0, 10)).toBeCloseTo(375, 10);
  });
  it('handles sub-intervals, reversed bounds and zero width', () => {
    expect(exactVolume(P, 1, 2)).toBeCloseTo((30 + 40) / 2, 10);
    expect(exactVolume(P, 10, 0)).toBeCloseTo(-375, 10);
    expect(exactVolume(P, 4, 4)).toBe(0);
  });
  it('units: constant 30 L/min for 4 min adds 120 L (L/min × min = L)', () => {
    expect(exactVolume([[0, 30], [4, 30]], 0, 4)).toBe(120);
  });
});

describe('rectangle sums converge to the integral', () => {
  it('computes the lesson example: 5 left rectangles = 380 L', () => {
    const { sum, width, rects } = riemannSum(P, 0, 10, 5, 'left');
    expect(width).toBe(2);
    expect(rects.map((r) => r.height)).toEqual([20, 40, 50, 50, 30]);
    expect(sum).toBe(380);
  });
  it('error shrinks as n grows for every method (left/right ~1/n, midpoint faster)', () => {
    const exact = exactVolume(P, 0, 10);
    for (const method of ['left', 'right', 'midpoint']) {
      const errs = [5, 10, 20, 40, 80, 160].map((n) => Math.abs(riemannSum(P, 0, 10, n, method).sum - exact));
      for (let i = 1; i < errs.length; i++) expect(errs[i]).toBeLessThanOrEqual(errs[i - 1] + 1e-9);
      expect(errs.at(-1)).toBeLessThan(0.5);
    }
    // smooth ramp: left-sum error halves when n doubles; midpoint is exact for linear Q
    const ramp = [[0, 10], [6, 70]];
    const e = (n, m) => Math.abs(riemannSum(ramp, 0, 6, n, m).sum - exactVolume(ramp, 0, 6));
    expect(e(20, 'left') / e(40, 'left')).toBeCloseTo(2, 5);
    expect(e(7, 'midpoint')).toBeLessThan(1e-9);
  });
  it('validates n and method', () => {
    expect(() => riemannSum(P, 0, 10, 0)).toThrow();
    expect(() => riemannSum(P, 0, 10, 2.5)).toThrow();
    expect(() => riemannSum(P, 0, 10, 4, 'trapezoid')).toThrow();
  });
});

describe('tank model with explicit overflow', () => {
  it('V(t) = V0 + ∫Q', () => {
    const s = tankAt(P, { initialVolume: 40, capacity: 500, t: 10 });
    expect(s.volume).toBeCloseTo(415, 10);
    expect(s.spilled).toBe(0);
    expect(s.full).toBe(false);
    expect(s.level).toBeCloseTo(0.83, 10);
  });
  it('caps at capacity and counts spilled water instead of losing it', () => {
    const doubled = P.map(([t, q]) => [t, q * 2]); // adds 750 L
    const s = tankAt(doubled, { initialVolume: 40, capacity: 500, t: 10 });
    expect(s.volume).toBe(500);
    expect(s.spilled).toBeCloseTo(290, 10);
    expect(s.volume + s.spilled).toBeCloseTo(40 + 750, 10); // conservation
  });
  it('rejects impossible tanks', () => {
    expect(() => tankAt(P, { initialVolume: -1, capacity: 10, t: 1 })).toThrow();
    expect(() => tankAt(P, { initialVolume: 20, capacity: 10, t: 1 })).toThrow();
  });
  it('finds the fill time numerically (and null if it never fills)', () => {
    const t = timeToFill([[0, 50], [10, 50]], { initialVolume: 100, capacity: 300 });
    expect(t).toBeCloseTo(4, 6);
    expect(timeToFill(P, { initialVolume: 40, capacity: 500 })).toBeNull();
  });
});

describe('named computations (answers are computed, never trusted)', () => {
  it('computes the lesson answers', () => {
    expect(compute('volume-at', { profile: P, initialVolume: 40, capacity: 500, t: 10 })).toBeCloseTo(415);
    expect(compute('riemann', { profile: P, a: 0, b: 10, n: 5, method: 'left' })).toBe(380);
    expect(compute('constant-flow-volume', { rate: 30, minutes: 4, initialVolume: 100 })).toBe(220);
    expect(compute('ramp-volume', { q0: 15, q1: 70, duration: 6, initialVolume: 150 })).toBe(405);
  });
  it('rejects unknown computations, extra args and bad values', () => {
    expect(() => compute('eval', {})).toThrow(/Unknown/);
    expect(() => compute('ramp-volume', { q0: 1, q1: 2, duration: 3, initialVolume: 0, code: 'x' })).toThrow(/Unexpected/);
    expect(() => compute('ramp-volume', { q0: -1, q1: 2, duration: 3, initialVolume: 0 })).toThrow();
    expect(() => compute('riemann', { profile: P, a: 0, b: 10, n: 1e6, method: 'left' })).toThrow();
  });
  it('picks reproducible new values within ranges and fills templates with numbers only', () => {
    const ranges = { q0: [10, 30, 5], q1: [40, 70, 10] };
    expect(pickValues(ranges, 7)).toEqual(pickValues(ranges, 7));
    for (let seed = 1; seed < 200; seed++) {
      const v = pickValues(ranges, seed);
      expect([10, 15, 20, 25, 30]).toContain(v.q0);
      expect([40, 50, 60, 70]).toContain(v.q1);
    }
    expect(fillTemplate('من {q0} لـ {q1} و{evil}', { q0: 10, q1: 40.256, evil: '<b>' })).toBe('من 10 لـ 40.26 و{evil}');
  });
});
