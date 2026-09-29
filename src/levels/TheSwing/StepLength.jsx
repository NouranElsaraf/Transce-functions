/**
 * Step 3 — Longer rope. Two sliders (rope length, pull-back angle) and a live
 * period readout. Two predictions uncover T = 2π√(L/g) and that amplitude
 * doesn't matter (for small swings).
 * @module TheSwing/StepLength
 */
import { useState } from 'react';
import StepLayout from '../../components/StepLayout.jsx';
import Slider from '../../components/Slider.jsx';
import Choices from '../../components/Choices.jsx';
import Readout from '../../components/Readout.jsx';
import M from '../../components/MathText.jsx';
import { useAnimationFrame } from '../../hooks/useAnimationFrame.js';
import Pendulum from './Pendulum.jsx';
import { angleAt, periodFor } from './pendulum.js';

const QUESTIONS = [
  {
    prompt: 'Make the rope 4× longer (1 m → 4 m). The time for one swing becomes…',
    correct: '2x',
    options: [
      { id: '4x', label: '4× longer', why: 'Try it with the slider: 1 m gives about 2 s. What does 4 m give?' },
      { id: '2x', label: '2× longer' },
      { id: 'same', label: 'The same', why: 'Try it! The long rope is clearly slower.' },
      { id: 'short', label: 'Shorter', why: 'A longer rope has further to travel — try it.' },
    ],
  },
  {
    prompt: 'Now pull it back further (bigger angle). The time for one swing…',
    correct: 'same',
    options: [
      { id: 'longer', label: 'Gets longer', why: 'It travels further… but it also moves faster. Check the period readout.' },
      { id: 'same', label: 'Stays (almost) the same' },
      { id: 'shorter', label: 'Gets shorter', why: 'Watch the period readout as you drag the angle slider.' },
    ],
  },
];

export default function StepLength({ api }) {
  const [L, setL] = useState(1);
  const [A, setA] = useState(20);
  const [time, setTime] = useState(0);
  const [q, setQ] = useState(0);
  const done = q >= QUESTIONS.length;
  useAnimationFrame((dt) => setTime((t) => t + dt));

  const T = periodFor(L);
  const question = QUESTIONS[Math.min(q, QUESTIONS.length - 1)];

  return (
    <StepLayout
      api={api}
      eyebrow="Experiment"
      prompt={done ? 'Galileo would be proud.' : question.prompt}
      sub="Experiment with the sliders before you answer — that's the whole point."
      hint={q === 0 ? 'Compare the period at 1 m and at 4 m.' : 'Drag the angle slider and keep your eye on the period number.'}
      done={done}
      insight={
        <>
          The period depends on the rope: 4× the length only doubles the time (a square root!). But how far you pull it back
          barely matters — Galileo spotted this watching a swinging cathedral lamp.
        </>
      }
      formula={
        <M block>
          T = 2π<span className="up">√</span>(L / g)
        </M>
      }
      side={
        <>
          <Readout
            items={[
              { label: 'Rope', value: `${L.toFixed(2)} m` },
              { label: 'Period T', value: `${T.toFixed(2)} s`, color: 'var(--c-series-5)' },
            ]}
          />
          <div className="controls">
            <Slider label="Rope length" value={L} min={0.25} max={4} step={0.25} onChange={setL} format={(v) => `${v} m`} />
            <Slider label="Pull-back angle" value={A} min={5} max={35} step={1} onChange={setA} format={(v) => `${v}°`} />
          </div>
          {!done && (
            <Choices key={q} api={api} options={question.options} correct={question.correct} onSolved={() => setTimeout(() => setQ((n) => n + 1), 700)} />
          )}
        </>
      }
    >
      <Pendulum angle={angleAt(time, A, L)} L={L} maxL={4} amplitude={A} height={420} timeLabel={`one swing: ${T.toFixed(2)} s`} />
    </StepLayout>
  );
}
