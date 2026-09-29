/**
 * Mini-objective list. Items tick with a pop when `done` becomes true —
 * small wins inside a step keep momentum up.
 * @module Checklist
 */
import Icon from './Icon.jsx';

export default function Checklist({ items }) {
  return (
    <ul className="checklist">
      {items.map((it) => (
        <li key={it.label} className={it.done ? 'is-done' : ''}>
          <span className="check-box">{it.done && <Icon name="check" size={14} strokeWidth={3} />}</span>
          <span>{it.label}</span>
        </li>
      ))}
    </ul>
  );
}
