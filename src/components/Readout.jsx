/**
 * Row of labelled live numbers ("time 3.2 s · speed 12 m/s").
 * @module Readout
 */
export default function Readout({ items }) {
  return (
    <div className="readout">
      {items.map((it) => (
        <div className="readout-item" key={it.label} style={it.color ? { color: it.color } : undefined}>
          <span>{it.label}</span>
          <b>{it.value}</b>
        </div>
      ))}
    </div>
  );
}
