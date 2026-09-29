/**
 * Inline math typography: `<M>y = a<sup>x</sup></M>`.
 * Uses a serif italic face so formulas feel distinct from UI text.
 * `block` renders it centred on its own line with a gentle reveal animation.
 * @module MathText
 */
export default function M({ children, block = false, className = '' }) {
  const Tag = block ? 'div' : 'span';
  return <Tag className={`math ${block ? 'math-block' : ''} ${className}`}>{children}</Tag>;
}
