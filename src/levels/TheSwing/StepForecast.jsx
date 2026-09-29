/**
 * Step 4 — Forecast. Only the first 4 seconds of the graph are known.
 * Predict the position at 7.5 s using periodicity, then fast-forward to check.
 * @module TheSwing/StepForecast
 */
import { useRef, useState } from 'react';
import StepLayout from '../../components/StepLayout.jsx';
import Plot from '../../components/Plot.jsx';
import Choices from '../../components/Choices.jsx';
import { useAnimationFrame } from '../../hooks/useAnimationFrame.js';
import Pendulum from './Pendulum.jsx';
import { angleAt } from './pendulum.js';

const A = 30;
const KNOWN = 4;
const ASK = 7.5;

export default function StepForecast({ api }) {
  const [time, setTime] = useState(KNOWN);
  const ref = useRef(KNOWN);
  const [phase, setPhase] = useState('ask'); // ask | play | done
  const done = phase === 'done';

  useAnimationFrame((dt) => {
    const next = Math.min(ASK, ref.current + dt * 1.5);
    ref.current = next;
    setTime(next);
    if (next >= ASK) setPhase('done');
  }, phase === 'play');

  return (
    <StepLayout
      api={api}
      eyebrow="Forecast"
      prompt={`You only have the first ${KNOWN} seconds of data. Where will the pendulum be at t = ${ASK} s?`}
      sub="No simulation allowed — just the pattern."
      hint="The pattern repeats every 2 s. Knock off whole periods: 7.5 → 5.5 → 3.5 → 1.5. Read 1.5 s off the graph."
      done={done}
      insight={
        <>
          You didn’t need to watch 7.5 seconds: the motion repeats every 2 s, so 7.5 s looks exactly like 1.5 s. One cycle of a
          periodic function predicts its entire future.
        </>
      }
    >
      <Plot
        x={[-0.3, 8.2]}
        y={[-42, 42]}
        height={260}
        ariaLabel="Known pendulum data for four seconds, then unknown"
        xLabel="time (s) →"
        yLabel="↑ angle (°)"
        fns={[
          { f: (t) => angleAt(t, A), domain: [0, KNOWN], color: 's5', width: 3.5 },
          ...(phase !== 'ask' ? [{ f: (t) => angleAt(t, A), domain: [KNOWN, time], color: 'good', width: 3.5 }] : []),
        ]}
        lines={[{ x1: ASK, y1: -42, x2: ASK, y2: 42, color: 's2', width: 2, dash: [6, 6] }]}
        points={phase !== 'ask' ? [{ x: time, y: angleAt(time, A), color: 'good' }] : [{ x: ASK, y: 38, color: 's2', r: 0.1, label: '?' }]}
        underlay={(ctx, view) => {
          const [x0] = view.toPx(KNOWN, 0);
          ctx.fillStyle = view.colors.grid;
          ctx.fillRect(x0, 0, view.width - x0, view.height);
        }}
      />
      {phase !== 'ask' && <Pendulum angle={angleAt(time, A)} amplitude={A} height={240} timeLabel={`t = ${time.toFixed(1)} s`} />}
      {phase === 'ask' && (
        <Choices
          api={api}
          columns={3}
          size="lg"
          correct="middle"
          options={[
            { id: 'left', label: 'Far left', why: 'Far left happens at 1 s, 3 s, 5 s, 7 s… 7.5 s is a bit later.' },
            { id: 'middle', label: 'In the middle' },
            { id: 'right', label: 'Far right', why: 'Far right happens at 0, 2, 4, 6, 8 s. 7.5 s isn’t one of them.' },
          ]}
          onSolved={() => setTimeout(() => setPhase('play'), 600)}
        />
      )}
    </StepLayout>
  );
}
