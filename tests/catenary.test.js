import { describe, expect, it } from 'vitest';
import { beads, chainCurve, circleArc, parabolaFit, solveA } from '../src/levels/HyperbolicWorld/catenary.js';

describe('catenary', () => {
  it('solves for a chain of the requested length', () => {
    const a = solveA(6, 9);
    expect(2 * a * Math.sinh(6 / (2 * a))).toBeCloseTo(9, 6);
  });

  it('chain passes through both posts at height 0 and sags below', () => {
    const { f, sag } = chainCurve(6, 9);
    expect(f(3)).toBeCloseTo(0, 6);
    expect(f(-3)).toBeCloseTo(0, 6);
    expect(f(0)).toBeCloseTo(sag, 6);
    expect(sag).toBeLessThan(0);
  });

  it('parabola and circle share the endpoints and bottom but differ in between', () => {
    const { f, sag } = chainCurve(6, 9);
    const p = parabolaFit(6, sag);
    expect(p(3)).toBeCloseTo(0, 6);
    expect(p(0)).toBeCloseTo(sag, 6);
    for (const span of [2, 6]) {
      const { sag: s } = chainCurve(span, 9);
      const arc = circleArc(span, s, 100);
      expect(arc[0][0]).toBeCloseTo(-span / 2, 6);
      expect(arc[0][1]).toBeCloseTo(0, 6);
      expect(arc[100][0]).toBeCloseTo(span / 2, 6);
      expect(arc[50][1]).toBeCloseTo(s, 6);
    }
    const { f: f4, sag: s4 } = chainCurve(4, 9);
    const maxGap = Math.max(...Array.from({ length: 41 }, (_, i) => Math.abs(parabolaFit(4, s4)(-2 + i / 10) - f4(-2 + i / 10))));
    expect(maxGap).toBeGreaterThan(0.3); // visibly not a parabola
    expect(Math.abs(p(0) - f(0))).toBeLessThan(1e-9);
  });

  it('beads are spaced along the full chain length', () => {
    const pts = beads(6, 9, 90);
    let length = 0;
    for (let i = 1; i < pts.length; i++) length += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    expect(length).toBeCloseTo(9, 1);
  });
});
