/**
 * Tiny inline curve sketch with a caption, used as a visual answer option
 * ("which shape will appear?") so players compare shapes, not words.
 * @module Sketch
 */
export default function Sketch({ d, text }) {
  return (
    <span className="sketch">
      <svg viewBox="0 0 80 30" width="80" height="30" aria-hidden="true">
        <path d={d} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <span>{text}</span>
    </span>
  );
}
