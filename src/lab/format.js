/**
 * Number formatting for the lab (Western digits — as on lab scales and in
 * Egyptian engineering classes — with thousands separators).
 * @module lab/format
 */
export const fmt = (n, digits = 0) =>
  Number.isFinite(n) ? n.toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: digits }) : '—';

/** Parse a student's number: accepts Arabic-Indic digits, "٫" and "," decimal marks. */
export function parseNumber(input) {
  if (typeof input !== 'string') return NaN;
  const s = input
    .trim()
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٫,]/g, '.')
    .replace(/\s|لتر|L/gi, '');
  if (!/^-?\d+(\.\d+)?$/.test(s)) return NaN;
  return Number(s);
}

/** Within tolerance? `{type: 'relative'|'absolute', value}` */
export function withinTolerance(value, answer, tolerance) {
  if (!Number.isFinite(value)) return false;
  const allowed = tolerance.type === 'relative' ? Math.abs(answer) * tolerance.value : tolerance.value;
  return Math.abs(value - answer) <= allowed + 1e-9;
}
