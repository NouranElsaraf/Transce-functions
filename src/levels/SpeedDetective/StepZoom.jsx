/**
 * Step 3 — Zoom in. A secant line between two moments gives an *average* speed.
 * Shrinking the gap makes the secant hug the tangent, and the average settles on
 * a single number. Only then is the derivative's limit notation revealed.
 * @module SpeedDetective/StepZoom
 */
import { useMemo, useState } from 'react';
import StepLayout from '../../components/StepLayout.jsx';
import Plot from '../../components/Plot.jsx';
import Slider from '../../components/Slider.jsx';
import Choices from '../../components/Choices.jsx';
import Checklist from '../../components/Checklist.jsx';
import M from '../../components/MathText.jsx';
import Frac from '../../components/Frac.jsx';
import { secantSlope } from '../../core/mathUtils.js';
import { DURATION, position, speed } from './trip.js';

const T0 = 4.8;
const MILESTONES = [2, 1, 0.3, 0.1, 0.03, 0.01];
const hFromSlider = (v) => 3 * 10 ** (-2.5 * v);

export default function StepZoom({ api }) {
  const [v, setV] = useState(0);
  const [done, setDone] = useState(false);
  const h = hFromSlider(v);
  const avg = secantSlope(position, T0, h);
  const exact = speed(T0);
  const shrunk = h < 0.05;

  const options = useMemo(() => {
    const right = exact.toFixed(1);
    const candidates = [
      { id: 'right', label: `${right} m/s` },
      { id: 'big', label: `${secantSlope(position, T0, 3).toFixed(1)} m/s`, why: 'That was the average over the big 3-second gap.' },
      { id: 'start', label: `${(position(T0) / T0).toFixed(1)} m/s`, why: 'That is the average since the start of the trip, not right now.' },
      { id: 'zero', label: '0 m/s', why: 'The gap shrinks to zero, but the ratio does not — watch the readout.' },
    ];
    return candidates.sort((a, b) => parseFloat(a.label) - parseFloat(b.label));
  }, [exact]);

  const p0 = [T0, position(T0)];
  const p1 = [T0 + h, position(T0 + h)];
  const ext = 2.5; // extend the secant beyond the points so it is visible

  return (
    <StepLayout
      api={api}
      eyebrow="Zoom in"
      prompt="Shrink the gap between the two moments. What does the average speed settle on?"
      sub="Average speed = distance covered ÷ time taken. The orange line joins the two moments."
      hint="Slide all the way right. The last few readings barely change — that's the number."
      done={done}
      insight={
        <>
          As the gap shrinks, the average speed stops changing: it settles on the <b>instantaneous</b> speed. That limiting
          slope has a name — the <b>derivative</b>.
        </>
      }
      formula={
        <M block>
          f′(t) ={' '}
          <span className="lim">
            lim<small>h→0</small>
          </span>
          <Frac top={<>f(t + h) − f(t)</>} bottom="h" />
        </M>
      }
      side={
        <>
          <div className="readout">
            <div className="readout-item">
              <span>Gap h</span>
              <b>{h < 0.1 ? h.toFixed(3) : h.toFixed(2)} s</b>
            </div>
            <div className="readout-item" style={{ color: 'var(--c-series-4)' }}>
              <span>Average speed</span>
              <b>{avg.toFixed(2)} m/s</b>
            </div>
          </div>
          <Checklist items={MILESTONES.map((m) => ({ label: `Gap below ${m} s`, done: h <= m + 1e-9 }))} />
        </>
      }
    >
      <Plot
        x={[T0 - 3, T0 + 4]}
        y={[position(T0 - 3) - 5, position(T0 + 4) + 5]}
        height={330}
        ariaLabel="Zoomed position graph with a secant line"
        xLabel="time (s) →"
        yLabel="↑ position (m)"
        fns={[{ f: position, domain: [0, DURATION], width: 3.5 }]}
        lines={[
          {
            x1: p0[0] - ext,
            y1: p0[1] - avg * ext,
            x2: p1[0] + ext,
            y2: p1[1] + avg * ext,
            color: 's4',
            width: 3,
          },
        ]}
        points={[
          { x: p0[0], y: p0[1], color: 's4', label: 't' },
          { x: p1[0], y: p1[1], color: 's4', r: 6, label: h > 0.4 ? 't + h' : '' },
        ]}
      />
      <Slider label="Shrink the gap →" value={v} min={0} max={1} step={0.005} onChange={setV} hideValue />
      {shrunk && (
        <div className="appear">
          <p className="callout">
            The gap is almost nothing. What speed was the car doing <i>at exactly</i> t = {T0} s?
          </p>
          <Choices api={api} options={options} correct="right" onSolved={() => setDone(true)} />
        </div>
      )}
    </StepLayout>
  );
}
