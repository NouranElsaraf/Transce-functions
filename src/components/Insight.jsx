/**
 * The "I noticed…" card that appears *after* an interaction.
 * Keep `children` to 2–3 sentences; `formula` is revealed underneath with a flourish.
 * @module Insight
 */
import Icon from './Icon.jsx';

export default function Insight({ title = 'You noticed', children, formula }) {
  return (
    <div className="insight" role="status">
      <div className="insight-title">
        <Icon name="spark" size={18} /> {title}
      </div>
      <div className="insight-body">{children}</div>
      {formula && <div className="insight-formula">{formula}</div>}
    </div>
  );
}
