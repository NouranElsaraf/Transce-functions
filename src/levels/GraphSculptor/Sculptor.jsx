/**
 * The sculpting table: a base curve, a dashed target "ghost", and plain-language
 * controls (no symbols until the player has felt what each one does).
 *
 * The maths lives in sculptMath.js.
 * Calls `onMatch` once when the player's curve matches the target.
 * @module GraphSculptor/Sculptor
 */
import { useEffect, useRef, useState } from 'react';
import Plot from '../../components/Plot.jsx';
import Slider from '../../components/Slider.jsx';
import Icon from '../../components/Icon.jsx';
import { sound } from '../../core/sound.js';
import M from '../../components/MathText.jsx';
import { BASES, DEFAULTS, equationFor, matches, sculpt } from './sculptMath.js';

export { BASES };

const CONTROLS = {
  k: { label: 'Add to the result', min: -4, max: 4, step: 0.5, color: 's1' },
  c: { label: 'Add to x first', min: -4, max: 4, step: 0.5, color: 's2' },
  a: { label: 'Multiply the result', min: 0.25, max: 3, step: 0.25, color: 's3' },
  b: { label: 'Multiply x first', min: 0.25, max: 3, step: 0.25, color: 's4' },
  flipY: { label: 'Flip the result', toggle: true },
  flipX: { label: 'Flip x first', toggle: true },
};

export default function Sculptor({ base = 'square', controls, target, onMatch, showEquation = false, height = 340 }) {
  const [p, setP] = useState(DEFAULTS);
  const matchedRef = useRef(false);
  const B = BASES[base];
  const matched = matches(p, target);

  useEffect(() => {
    if (matched && !matchedRef.current) {
      matchedRef.current = true;
      onMatch?.();
    }
  }, [matched, onMatch]);

  const set = (key, value) => {
    if (matchedRef.current) return;
    setP((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className={`sculptor ${matched ? 'is-matched' : ''}`}>
      <Plot
        x={B.x}
        y={B.y}
        height={height}
        ariaLabel="Your curve and the target curve"
        fns={[
          { f: sculpt(B.f, target), color: matched ? 'good' : 'muted', width: 8, alpha: 0.35, dash: matched ? undefined : [2, 12] },
          { f: sculpt(B.f, p), color: matched ? 'good' : 'accent', width: 3.5, glow: matched },
        ]}
      />
      <div className="sculptor-legend legend">
        <span>
          <i style={{ background: 'var(--c-accent)' }} />
          Your curve
        </span>
        <span>
          <i style={{ background: 'var(--c-muted)' }} />
          Target shape
        </span>
        {matched && (
          <span className="tag is-good">
            <Icon name="check" size={14} /> Matched!
          </span>
        )}
      </div>
      {showEquation && (
        <div className="live-eq">
          <M>{equationFor(base, p)}</M>
        </div>
      )}
      <div className="controls">
        {controls.map((key) => {
          const c = CONTROLS[key];
          if (c.toggle) {
            return (
              <button
                key={key}
                type="button"
                className={`flip-toggle ${p[key] ? 'is-on' : ''}`}
                aria-pressed={p[key]}
                disabled={matched}
                onClick={() => {
                  sound.play('whoosh');
                  set(key, !p[key]);
                }}
              >
                <Icon name="replay" size={18} /> {c.label}
              </button>
            );
          }
          return (
            <Slider
              key={key}
              label={c.label}
              value={p[key]}
              min={c.min}
              max={c.max}
              step={c.step}
              disabled={matched}
              color={`var(--c-series-${c.color.slice(1)})`}
              format={(v) => (key === 'a' || key === 'b' ? `× ${v}` : v > 0 ? `+${v}` : v)}
              onChange={(v) => set(key, v)}
            />
          );
        })}
      </div>
    </div>
  );
}
