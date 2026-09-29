/**
 * Stacked fraction for use inside <M>: <Frac top="Δy" bottom="Δx" />.
 * @module Frac
 */
export default function Frac({ top, bottom }) {
  return (
    <span className="frac">
      <span>{top}</span>
      <span>{bottom}</span>
    </span>
  );
}
