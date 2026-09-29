import { describe, expect, it } from 'vitest';
import { CODE, elapsed, markSolved, startClock } from '../src/levels/EscapeRoom/vault.js';

describe('escape room vault', () => {
  it('the code spells the digits of e', () => {
    expect(Number(`${CODE[0]}.${CODE.slice(1).join('')}`)).toBeCloseTo(Math.E, 3);
  });

  it('only reports a time for a full run', () => {
    startClock();
    expect(elapsed()).toBeNull();
    CODE.forEach((_, i) => markSolved(i));
    expect(elapsed()).toMatch(/^\d+:\d\d$/);
    startClock();
    expect(elapsed()).toBeNull();
  });
});
