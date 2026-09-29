import { describe, expect, it } from 'vitest';
import { catenary, clamp, derivative, formatBig, mapRange, round, secantSlope, wrapAngle, TAU } from '../src/core/mathUtils.js';

describe('mathUtils', () => {
  it('numerical derivative matches known derivatives', () => {
    expect(derivative((x) => x * x, 3)).toBeCloseTo(6, 5);
    expect(derivative(Math.exp, 0)).toBeCloseTo(1, 5);
    expect(derivative(Math.sin, 0)).toBeCloseTo(1, 5);
  });

  it('secant slope approaches the derivative as h shrinks', () => {
    const f = (x) => x ** 3;
    const errBig = Math.abs(secantSlope(f, 1, 1) - 3);
    const errSmall = Math.abs(secantSlope(f, 1, 0.01) - 3);
    expect(errSmall).toBeLessThan(errBig);
  });

  it('catenary is cosh-shaped with its lowest point at a', () => {
    expect(catenary(0, 2)).toBe(2);
    expect(catenary(1, 2)).toBeCloseTo(catenary(-1, 2));
  });

  it('helpers', () => {
    expect(clamp(5, 0, 1)).toBe(1);
    expect(mapRange(5, 0, 10, 0, 100)).toBe(50);
    expect(round(-0.0001)).toBe(0);
    expect(wrapAngle(-Math.PI)).toBeCloseTo(Math.PI);
    expect(wrapAngle(TAU + 1)).toBeCloseTo(1);
  });

  it('formats huge numbers readably', () => {
    expect(formatBig(1234)).toBe('1,234');
    expect(formatBig(2 ** 30)).toBe('1.1 billion');
    expect(formatBig(5e6)).toBe('5.0 million');
  });
});
