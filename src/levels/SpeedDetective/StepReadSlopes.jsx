/**
 * Step 4 — Read the slopes. A new trip where the car stops and reverses.
 * Two quick questions build the rule: flat tangent = stopped, downhill = backwards.
 * @module SpeedDetective/StepReadSlopes
 */
import { useState } from 'react';
import StepLayout from '../../components/StepLayout.jsx';
import Plot from '../../components/Plot.jsx';
import Choices from '../../components/Choices.jsx';
import { derivative } from '../../core/mathUtils.js';
import Road from './Road.jsx';
import { tripBack } from './trip.js';
import { useAnimationFrame } from '../../hooks/useAnimationFrame.js';

const POINTS = [
  { id: 'P', t: 1.5, color: 's1' },
  { id: 'Q', t: 4, color: 's3' },
  { id: 'R', t: 7, color: 's2' },
];

const QUESTIONS = [
  { prompt: 'At which point was the car standing still (for an instant)?', correct: 'Q' },
  { prompt: 'At which point was the car driving backwards?', correct: 'R' },
];

export default function StepReadSlopes({ api }) {
  const [q, setQ] = useState(0);
  const [solved, setSolved] = useState([]);
  const done = solved.length === QUESTIONS.length;
  const [time, setTime] = useState(0);
  useAnimationFrame((dt) => setTime((t) => (t + dt * 1.5) % 10));

  return (
    <StepLayout
      api={api}
      eyebrow="Another trip"
      prompt={done ? 'Case closed.' : QUESTIONS[q].prompt}
      sub="This time the driver forgot something and turned back. Read the story from the graph alone."
      hint="Imagine the tangent line at each point: is it going uphill, flat, or downhill?"
      done={done}
      insight={
        <>
          A <b>flat</b> tangent means zero speed. A <b>downhill</b> tangent means position is decreasing — the car is going
          backwards. The derivative tells you both how fast <i>and</i> which way.
        </>
      }
    >
      <Road s={10 + tripBack(time) * 2} ghost={10} height={90} markers={false} />
      <Plot
        x={[-0.5, 10]}
        y={[-15, 50]}
        height={300}
        ariaLabel="Position graph that rises, flattens and falls"
        xLabel="time (s) →"
        yLabel="↑ position (m)"
        fns={[{ f: tripBack, domain: [0, 10], width: 3.5 }]}
        lines={(solved.length ? POINTS : []).map((p) => {
          const y = tripBack(p.t);
          const m = derivative(tripBack, p.t);
          return { x1: p.t - 1.3, y1: y - m * 1.3, x2: p.t + 1.3, y2: y + m * 1.3, color: p.color, width: 2.5 };
        })}
        points={[
          ...POINTS.map((p) => ({ x: p.t, y: tripBack(p.t), color: p.color, label: p.id, r: 8 })),
          { x: time, y: tripBack(time), color: 'muted', r: 5 },
        ]}
      />
      {!done && (
        <Choices
          key={q}
          api={api}
          columns={3}
          size="lg"
          correct={QUESTIONS[q].correct}
          options={POINTS.map((p) => ({
            id: p.id,
            label: p.id,
            why:
              p.id === 'P'
                ? 'At P the graph is climbing — the position is increasing.'
                : p.id === 'Q'
                  ? 'At Q the graph is flat. Is it moving at all?'
                  : 'At R the position is still positive… but is it growing or shrinking?',
          }))}
          onSolved={() => {
            setSolved((s) => [...s, q]);
            if (q + 1 < QUESTIONS.length) setTimeout(() => setQ(q + 1), 700);
          }}
        />
      )}
    </StepLayout>
  );
}
