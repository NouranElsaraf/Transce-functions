/**
 * The "I noticed…" card that appears *after* an interaction.
 * Keep `children` to 2–3 sentences; `formula` is revealed underneath with a flourish.
 * `bridge` (real-life context) is shown just before the formula so the equation reads as a conclusion.
 * @module Insight
 */
import Icon from './Icon.jsx';

export default function Insight({ title = 'You noticed', children, formula, bridge }) {
  return (
    <div className="insight" role="status">
      <div className="insight-title">
        <Icon name="spark" size={18} /> {title}
      </div>
      <div className="insight-body">{children}</div>
      {formula && bridge}
      {formula && <div className="insight-formula">{formula}</div>}
    </div>
  );
}
