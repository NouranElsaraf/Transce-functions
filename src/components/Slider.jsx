/**
 * Labelled range slider with a live value bubble.
 * Set `hideValue` when the number itself would give away an answer.
 * @module Slider
 */
import { useId } from 'react';

export default function Slider({
  label,
  value,
  min = 0,
  max = 1,
  step = 0.01,
  onChange,
  format = (v) => v,
  hideValue = false,
  color,
  disabled = false,
}) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className={`slider ${disabled ? 'is-disabled' : ''}`} style={color ? { '--slider-color': color } : undefined}>
      <div className="slider-head">
        <label htmlFor={id}>{label}</label>
        {!hideValue && <output htmlFor={id}>{format(value)}</output>}
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        style={{ '--pct': `${pct}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
