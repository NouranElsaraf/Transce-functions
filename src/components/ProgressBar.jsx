/**
 * Animated horizontal progress bar (value 0–1).
 * @module ProgressBar
 */
export default function ProgressBar({ value, label, color, thin = false }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div
      className={`progress ${thin ? 'progress-thin' : ''}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={label}
    >
      <div className="progress-fill" style={{ width: `${pct}%`, ...(color ? { background: color } : null) }} />
    </div>
  );
}
