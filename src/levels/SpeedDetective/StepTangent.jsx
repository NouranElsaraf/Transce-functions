/**
 * Step 2 — Steepest point. The trip becomes a position-time graph. Dragging a
 * marker along it shows a tangent line and the live speedometer: the player
 * discovers that steepness *is* speed, then locks in the fastest moment.
 * @module SpeedDetective/StepTangent
 */
import { useState } from 'react';
import StepLayout from '../../components/StepLayout.jsx';
import Plot from '../../components/Plot.jsx';
import Button from '../../components/Button.jsx';
import Readout from '../../components/Readout.jsx';
import { clamp } from '../../core/mathUtils.js';
import Road from './Road.jsx';
import { DURATION, FASTEST_T, position, speed } from './trip.js';

const TOLERANCE = 0.45;

export default function StepTangent({ api }) {
  const [t, setT] = useState(2);
  const [moved, setMoved] = useState(0);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const m = speed(t);
  const s = position(t);
  const span = 1.6;

  const lockIn = () => {
    const ok = Math.abs(t - FASTEST_T) <= TOLERANCE;
    api.answer(ok);
    if (ok) setDone(true);
    else setFeedback(`Speed here is ${m.toFixed(1)} m/s. Somewhere the graph is steeper — keep hunting.`);
  };

  return (
    <StepLayout
      api={api}
      eyebrow="The graph remembers"
      prompt="Drag the dot along the journey. Find the moment the car was fastest."
      sub="The line touching the curve shows how steep the graph is right there. Watch the speedometer as you drag."
      hint="Watch the speed readout. Where the curve climbs most steeply, the number peaks."
      done={done}
      insight={
        <>
          The line that just touches the curve is a <b>tangent</b>. Its steepness — the <b>slope</b> — equals the speed at that
          instant. Steepest graph, fastest car.
        </>
      }
      side={
        <>
          <Readout
            items={[
              { label: 'Time', value: `${t.toFixed(1)} s` },
              { label: 'Position', value: `${s.toFixed(0)} m` },
              { label: 'Speed (slope)', value: `${m.toFixed(1)} m/s`, color: 'var(--c-series-2)' },
            ]}
          />
          <div className="speedo" aria-hidden="true">
            <div className="speedo-fill" style={{ width: `${Math.min(100, (m / 30) * 100)}%` }} />
          </div>
          {!done && (
            <Button size="lg" icon="check" onClick={lockIn} disabled={moved < 3}>
              This is the fastest moment
            </Button>
          )}
          {feedback && !done && <p className="callout">{feedback}</p>}
        </>
      }
    >
      <Road s={s} height={96} markers={false} />
      <Plot
        x={[-0.6, DURATION + 0.4]}
        y={[-8, 110]}
        height={340}
        ariaLabel="Position versus time graph with a draggable tangent point"
        fns={[{ f: position, domain: [0, DURATION], width: 3.5 }]}
        lines={[
          {
            x1: t - span,
            y1: s - m * span,
            x2: t + span,
            y2: s + m * span,
            color: 's2',
            width: 3,
          },
        ]}
        points={[{ x: t, y: s, r: 9, ring: true, color: 's2' }]}
        xLabel="time (s) →"
        yLabel="↑ position (m)"
        onPointer={(type, p, dragging) => {
          if (done) return;
          if (type === 'down' || (type === 'move' && dragging)) {
            setT(clamp(p.x, 0, DURATION));
            setMoved((n) => n + 1);
            setFeedback(null);
          }
        }}
        cursor="grab"
      />
    </StepLayout>
  );
}
