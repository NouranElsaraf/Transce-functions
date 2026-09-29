/**
 * Pure maths behind the Graph Sculptor: base shapes, the transformation
 * y = s·a·f(t·b·x + c) + k, matching and equation formatting. React-free and unit-tested.
 * @module GraphSculptor/sculptMath
 */

export const BASES = {
  square: { f: (x) => x * x, name: 'x²', inner: (s) => `(${s})²`, x: [-6, 6], y: [-5, 7] },
  sin: { f: Math.sin, name: 'sin x', inner: (s) => `sin(${s})`, x: [-7, 7], y: [-3.5, 3.5] },
  exp: { f: Math.exp, name: 'eˣ', inner: (s) => `e^(${s})`, x: [-4, 4], y: [-5, 5] },
};

export const DEFAULTS = { a: 1, b: 1, c: 0, k: 0, flipY: false, flipX: false };

/** Build y(x) from a base function and parameters. */
export function sculpt(f, p) {
  const P = { ...DEFAULTS, ...p };
  const sy = P.flipY ? -1 : 1;
  const sx = P.flipX ? -1 : 1;
  return (x) => sy * P.a * f(sx * P.b * x + P.c) + P.k;
}

/** Do two parameter sets describe the same sculpture? */
export function matches(p, target) {
  const A = { ...DEFAULTS, ...p };
  const B = { ...DEFAULTS, ...target };
  return Object.keys(DEFAULTS).every((key) =>
    typeof A[key] === 'boolean' ? A[key] === B[key] : Math.abs(A[key] - B[key]) < 1e-6,
  );
}

const num = (v) => (Number.isInteger(v) ? String(v) : String(+v.toFixed(2)));

/** Human-readable equation for the current parameters, e.g. "y = −2·(x + 1)² + 3". */
export function equationFor(baseKey, p) {
  const P = { ...DEFAULTS, ...p };
  const base = BASES[baseKey];
  let inner = 'x';
  const bx = (P.flipX ? -1 : 1) * P.b;
  if (bx !== 1) inner = bx === -1 ? '−x' : `${num(bx).replace('-', '−')}x`;
  if (P.c) inner += P.c > 0 ? ` + ${num(P.c)}` : ` − ${num(-P.c)}`;
  let fx = inner === 'x' ? base.name : base.inner(inner);
  if (baseKey === 'exp' && inner !== 'x') fx = `e^(${inner})`;
  const ay = (P.flipY ? -1 : 1) * P.a;
  const coef = ay === 1 ? '' : ay === -1 ? '−' : `${num(ay).replace('-', '−')}·`;
  const k = P.k ? (P.k > 0 ? ` + ${num(P.k)}` : ` − ${num(-P.k)}`) : '';
  return `y = ${coef}${fx}${k}`;
}
