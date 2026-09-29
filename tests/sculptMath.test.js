import { describe, expect, it } from 'vitest';
import { BASES, equationFor, matches, sculpt } from '../src/levels/GraphSculptor/sculptMath.js';
import { STEP_CONFIGS } from '../src/levels/GraphSculptor/steps.js';

describe('Graph Sculptor maths', () => {
  it('adding inside shifts the graph left', () => {
    const f = sculpt(BASES.square.f, { c: 3 });
    expect(f(-3)).toBe(0); // the bottom of the bowl moved to x = -3
  });

  it('flips work on the outside and inside', () => {
    expect(sculpt(Math.exp, { flipY: true })(0)).toBe(-1);
    expect(sculpt(Math.exp, { flipX: true })(1)).toBeCloseTo(Math.exp(-1));
  });

  it('matching ignores float noise but not flips', () => {
    expect(matches({ k: 2.0000000001 }, { k: 2 })).toBe(true);
    expect(matches({ flipY: true }, {})).toBe(false);
  });

  it('formats equations', () => {
    expect(equationFor('square', {})).toBe('y = x²');
    expect(equationFor('square', { k: 2 })).toBe('y = x² + 2');
    expect(equationFor('square', { c: 3 })).toBe('y = (x + 3)²');
    expect(equationFor('square', { flipY: true, c: -2, k: 3 })).toBe('y = −(x − 2)² + 3');
    expect(equationFor('sin', { b: 2 })).toBe('y = sin(2x)');
    expect(equationFor('exp', { flipX: true })).toBe('y = e^(−x)');
  });

  it('every challenge target is reachable with its enabled controls', () => {
    for (const cfg of STEP_CONFIGS) {
      for (const ch of cfg.challenges) {
        for (const key of Object.keys(ch.target)) expect(ch.controls).toContain(key);
      }
    }
  });
});
