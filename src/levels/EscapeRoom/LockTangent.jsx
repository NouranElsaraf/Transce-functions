/**
 * Lock 1 — Flat spot. Drag a probe along the curve and lock it in where the
 * tangent is perfectly horizontal (either turning point works).
 * @module EscapeRoom/LockTangent
 */
import { useEffect, useState } from 'react';
import Plot from '../../components/Plot.jsx';
import Button from '../../components/Button.jsx';
import Slider from '../../components/Slider.jsx';
import { clamp, derivative } from '../../core/mathUtils.js';
import LockFrame from './LockFrame.jsx';
import { startClock } from './vault.js';

const f = (x) => (x * x * x) / 3 - x + 1;
const TOLERANCE = 0.1;

export default function LockTangent({ api }) {
  const [x, setX] = useState(-2.2);
  const [done, setDone] = useState(false);
  const [msg, setMsg] = useState(null);
  const m = derivative(f, x);

  useEffect(() => startClock(), []);

  return (
    <LockFrame
      index={0}
      api={api}
      done={done}
      eyebrow="The vault · Lock 1"
      prompt="The lock only turns where this curve is perfectly flat. Put the probe there."
      sub="Drag the probe along the curve. The line shows the tangent."
      hint="Flat means the tangent line is horizontal — a hilltop or a valley bottom."
      insight={<>A flat tangent means the rate of change is zero: the curve has stopped rising and is about to fall (or the other way round).</>}
    >
      <Plot
        x={[-3, 3]}
        y={[-2, 4]}
        height={320}
        cursor="grab"
        ariaLabel="A curve with a hill and a valley and a draggable probe"
        fns={[{ f, width: 3.5 }]}
        lines={[{ x1: x - 1.2, y1: f(x) - m * 1.2, x2: x + 1.2, y2: f(x) + m * 1.2, color: 's2', width: 3 }]}
        points={[{ x, y: f(x), color: 's2', r: 9, ring: true }]}
        onPointer={(type, p, dragging) => {
          if (!done && (type === 'down' || dragging)) {
            setX(clamp(p.x, -2.8, 2.8));
            setMsg(null);
          }
        }}
      />
      <Slider
        label="…or move the probe with the slider"
        value={x}
        min={-2.8}
        max={2.8}
        step={0.02}
        disabled={done}
        format={(v) => v.toFixed(2)}
        onChange={(v) => {
          setX(v);
          setMsg(null);
        }}
      />
      {!done && (
        <div className="row">
          <Button
            size="lg"
            icon="unlock"
            onClick={() => {
              const ok = Math.abs(m) < TOLERANCE;
              api.answer(ok);
              if (ok) setDone(true);
              else setMsg(m > 0 ? 'The lock rattles: the tangent still climbs.' : 'The lock rattles: the tangent still falls.');
            }}
          >
            Turn the lock
          </Button>
          {msg && <span className="callout">{msg}</span>}
        </div>
      )}
    </LockFrame>
  );
}
