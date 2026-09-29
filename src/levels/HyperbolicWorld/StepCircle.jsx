/**
 * Step 3 — Circle vs hyperbola. One slider t drives two points:
 * (cos t, sin t) on the unit circle and (cosh t, sinh t) on x² − y² = 1.
 * Shaded sectors have equal area t/2 in both worlds; live readouts let the
 * player discover which combination stays constant.
 * @module HyperbolicWorld/StepCircle
 */
import { useState } from 'react';
import StepLayout from '../../components/StepLayout.jsx';
import Plot from '../../components/Plot.jsx';
import Slider from '../../components/Slider.jsx';
import Choices from '../../components/Choices.jsx';
import Readout from '../../components/Readout.jsx';
import M from '../../components/MathText.jsx';

const QUESTIONS = [
  {
    prompt: 'Keep increasing t. What happens to the two points?',
    correct: 'split',
    options: [
      { id: 'split', label: 'The circle point loops forever; the hyperbola point runs off to infinity' },
      { id: 'both-loop', label: 'Both loop around', why: 'Push t to the end: does the purple point ever come back?' },
      { id: 'both-run', label: 'Both run away', why: 'The circle point can never leave its circle.' },
    ],
  },
  {
    prompt: 'For the hyperbola point, which number never changes?',
    correct: 'minus',
    options: [
      { id: 'plus', label: 'cosh² + sinh²', why: 'Watch that readout while you drag — it grows.' },
      { id: 'minus', label: 'cosh² − sinh²' },
      { id: 'times', label: 'cosh × sinh', why: 'That one changes (and even goes negative).' },
    ],
  },
];

function sector(ctx, view, points, color) {
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.18;
  ctx.beginPath();
  ctx.moveTo(...view.toPx(0, 0));
  points.forEach(([x, y]) => ctx.lineTo(...view.toPx(x, y)));
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

export default function StepCircle({ api }) {
  const [t, setT] = useState(0.8);
  const [q, setQ] = useState(0);
  const done = q >= QUESTIONS.length;
  const question = QUESTIONS[Math.min(q, QUESTIONS.length - 1)];
  const c = Math.cosh(t);
  const s = Math.sinh(t);
  const steps = 60;
  const arc = (fx, fy) => Array.from({ length: steps + 1 }, (_, i) => [fx((t * i) / steps), fy((t * i) / steps)]);

  return (
    <StepLayout
      api={api}
      eyebrow="Two worlds"
      prompt={done ? 'Cousins, not twins.' : question.prompt}
      sub="Both shaded regions always have the same area: t / 2. Same recipe, different curve."
      hint={q === 0 ? 'Drag t all the way to the right, then all the way to the left.' : 'Compare the three live readouts as you drag.'}
      done={done}
      insight={
        <>
          Trig functions live on a circle, where cos² + sin² = 1 — so they repeat. Hyperbolic functions live on a hyperbola,
          where cosh² − sinh² = 1 — so they never come back and grow like exponentials.
        </>
      }
      formula={
        <M block>
          cosh<sup>2</sup>t − sinh<sup>2</sup>t = 1
        </M>
      }
      side={
        <>
          <Readout
            items={[
              { label: 'cosh² + sinh²', value: (c * c + s * s).toFixed(2) },
              { label: 'cosh² − sinh²', value: (c * c - s * s).toFixed(2), color: 'var(--c-series-1)' },
              { label: 'cosh × sinh', value: (c * s).toFixed(2) },
            ]}
          />
          {!done && (
            <Choices key={q} api={api} options={question.options} correct={question.correct} onSolved={() => setTimeout(() => setQ((n) => n + 1), 700)} />
          )}
        </>
      }
    >
      <div className="beam-grid">
        <div className="stack">
          <div className="eyebrow">Circle · x² + y² = 1</div>
          <Plot
            equal
            x={[-1.6, 1.6]}
            y={[-1.6, 1.6]}
            height={280}
            ariaLabel="Unit circle with point cos t, sin t"
            underlay={(ctx, view) => sector(ctx, view, arc(Math.cos, Math.sin), view.colors.s4)}
            draw={(ctx, view) => {
              ctx.strokeStyle = view.colors.s4;
              ctx.lineWidth = 3;
              ctx.beginPath();
              const [cx, cy] = view.toPx(0, 0);
              ctx.arc(cx, cy, view.sx, 0, Math.PI * 2);
              ctx.stroke();
            }}
            lines={[{ x1: 0, y1: 0, x2: Math.cos(t), y2: Math.sin(t), color: 's4', width: 2 }]}
            points={[{ x: Math.cos(t), y: Math.sin(t), color: 's4', r: 8 }]}
          />
        </div>
        <div className="stack">
          <div className="eyebrow">Hyperbola · x² − y² = 1</div>
          <Plot
            x={[-0.8, 10.5]}
            y={[-10, 10]}
            height={280}
            ariaLabel="Hyperbola with point cosh t, sinh t"
            underlay={(ctx, view) => sector(ctx, view, arc(Math.cosh, Math.sinh), view.colors.s1)}
            fns={[
              { f: (x) => Math.sqrt(x * x - 1), domain: [1, 11], color: 's1' },
              { f: (x) => -Math.sqrt(x * x - 1), domain: [1, 11], color: 's1' },
            ]}
            lines={[{ x1: 0, y1: 0, x2: c, y2: s, color: 's1', width: 2 }]}
            points={[{ x: c, y: s, color: 's1', r: 8 }]}
          />
        </div>
      </div>
      <Slider label="t" value={t} min={-3} max={3} step={0.01} onChange={setT} format={(v) => v.toFixed(2)} />
    </StepLayout>
  );
}
