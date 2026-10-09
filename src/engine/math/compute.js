/**
 * Whitelisted computations that lesson content may reference *by name* to get
 * a correct answer. Content never contains code or trusted answer numbers:
 * an assessment says `{ compute: 'riemann', args: {...} }` and the engine
 * calculates the answer here. Each entry validates its own arguments.
 * @module engine/math/compute
 */
import { assertProfile, exactVolume, riemannSum, tankAt } from './accumulation.js';

const num = (v, name, { min = -Infinity, max = Infinity, integer = false } = {}) => {
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new RangeError(`${name} must be a number.`);
  if (integer && !Number.isInteger(v)) throw new RangeError(`${name} must be an integer.`);
  if (v < min || v > max) throw new RangeError(`${name} must be between ${min} and ${max}.`);
  return v;
};

export const COMPUTE = {
  /** Volume in the tank at time t (litres), overflow capped at capacity. */
  'volume-at': {
    unit: 'L',
    args: ['profile', 'initialVolume', 'capacity', 't'],
    run: ({ profile, initialVolume, capacity, t }) => {
      assertProfile(profile);
      num(t, 't', { min: 0 });
      return tankAt(profile, { initialVolume: num(initialVolume, 'initialVolume', { min: 0 }), capacity: num(capacity, 'capacity', { min: 1 }), t }).volume;
    },
  },
  /** Volume added between a and b (litres) = exact area under Q. */
  'volume-added': {
    unit: 'L',
    args: ['profile', 'a', 'b'],
    run: ({ profile, a, b }) => {
      assertProfile(profile);
      return exactVolume(profile, num(a, 'a', { min: 0 }), num(b, 'b', { min: 0 }));
    },
  },
  /** Rectangle sum of Q over [a, b] (litres). */
  riemann: {
    unit: 'L',
    args: ['profile', 'a', 'b', 'n', 'method'],
    run: ({ profile, a, b, n, method }) => {
      assertProfile(profile);
      return riemannSum(profile, num(a, 'a', { min: 0 }), num(b, 'b', { min: 0 }), num(n, 'n', { min: 1, max: 1000, integer: true }), method).sum;
    },
  },
  /** V₀ + rate × minutes for a constant flow (litres). */
  'constant-flow-volume': {
    unit: 'L',
    args: ['rate', 'minutes', 'initialVolume'],
    run: ({ rate, minutes, initialVolume }) =>
      num(initialVolume, 'initialVolume', { min: 0 }) + num(rate, 'rate', { min: 0 }) * num(minutes, 'minutes', { min: 0 }),
  },
  /** V₀ + area of a linear ramp from q0 to q1 over `duration` minutes (litres). */
  'ramp-volume': {
    unit: 'L',
    args: ['q0', 'q1', 'duration', 'initialVolume'],
    run: ({ q0, q1, duration, initialVolume }) =>
      num(initialVolume, 'initialVolume', { min: 0 }) +
      ((num(q0, 'q0', { min: 0 }) + num(q1, 'q1', { min: 0 })) / 2) * num(duration, 'duration', { min: 0 }),
  },
};

/** Run a named computation; throws on unknown names or bad arguments. */
export function compute(name, args) {
  const entry = COMPUTE[name];
  if (!entry) throw new RangeError(`Unknown computation "${name}".`);
  if (!args || typeof args !== 'object') throw new RangeError('Computation args must be an object.');
  const extra = Object.keys(args).filter((k) => !entry.args.includes(k));
  if (extra.length) throw new RangeError(`Unexpected argument(s) for ${name}: ${extra.join(', ')}.`);
  const value = entry.run(args);
  if (!Number.isFinite(value)) throw new RangeError(`${name} did not produce a finite number.`);
  return value;
}

/**
 * Pick concrete values for a "new values" challenge from inclusive integer-step
 * ranges `{ name: [min, max, step] }`, deterministically from `seed`.
 */
export function pickValues(ranges, seed) {
  let s = (seed >>> 0) || 1;
  const rand = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const out = {};
  for (const [name, [min, max, step]] of Object.entries(ranges)) {
    const count = Math.floor((max - min) / step) + 1;
    out[name] = min + Math.floor(rand() * count) * step;
  }
  return out;
}

/** Fill `{name}` placeholders with numbers only (no other substitution is possible). */
export function fillTemplate(template, values) {
  return template.replace(/\{([a-zA-Z][a-zA-Z0-9]*)\}/g, (m, key) => {
    const v = values[key];
    if (typeof v !== 'number' || !Number.isFinite(v)) return m;
    return String(Math.round(v * 100) / 100);
  });
}
