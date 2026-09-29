/**
 * Step 5 — Meet aˣ. Only now is the formula shown. One slider controls the
 * growth factor; three mini-goals lead to decay, the flat case, and finally the
 * discovery of e — the base whose tangent at x = 0 has slope exactly 1.
 * @module GrowingKingdom/StepBase
 */
import { useEffect, useRef, useState } from 'react';
import StepLayout from '../../components/StepLayout.jsx';
import Plot from '../../components/Plot.jsx';
import Slider from '../../components/Slider.jsx';
import Checklist from '../../components/Checklist.jsx';
import Readout from '../../components/Readout.jsx';
import M from '../../components/MathText.jsx';

const GOALS = [
  { id: 'decay', label: 'Make the kingdom shrink each day', test: (a) => a < 0.95 },
  { id: 'flat', label: 'Make nothing change at all', test: (a) => Math.abs(a - 1) < 0.015 },
  { id: 'e', label: 'Make the tangent at x = 0 match the dashed line', test: (a) => Math.abs(a - Math.E) < 0.03 },
];

export default function StepBase({ api }) {
  const [a, setA] = useState(2);
  const [hit, setHit] = useState({});
  const answered = useRef(new Set());
  const done = GOALS.every((g) => hit[g.id]);

  useEffect(() => {
    for (const g of GOALS) {
      if (!answered.current.has(g.id) && g.test(a)) {
        answered.current.add(g.id);
        api.answer(true);
        setHit((h) => ({ ...h, [g.id]: true }));
      }
    }
  }, [a, api]);

  const slope0 = Math.log(a);

  return (
    <StepLayout
      api={api}
      eyebrow="The pattern has a name"
      prompt={
        <>
          Doubling every day is <M>y = 2<sup>x</sup></M>. What if the daily factor were different?
        </>
      }
      sub="The slider sets the growth factor a — what the amount is multiplied by each day."
      hint="For the last goal, the slope readout should reach 1.00. The base you land on is a famous number."
      done={done}
      insight={
        <>
          Factor above 1 grows, below 1 decays, exactly 1 stays flat. And one special base, <b>e ≈ 2.718</b>, grows at a
          rate equal to its own height — its slope at every point equals its value.
        </>
      }
      formula={
        <M block>
          y = a<sup>x</sup> &nbsp;&nbsp;·&nbsp;&nbsp; e ≈ 2.71828…
        </M>
      }
      side={
        <>
          <Checklist items={GOALS.map((g) => ({ label: g.label, done: Boolean(hit[g.id]) }))} />
          <Readout
            items={[
              { label: 'Factor a', value: a.toFixed(2) },
              { label: 'Slope at x = 0', value: slope0.toFixed(2), color: 'var(--c-series-2)' },
            ]}
          />
        </>
      }
    >
      <Plot
        x={[-3, 3]}
        y={[-0.8, 6]}
        height={340}
        ariaLabel={`Graph of y equals ${a.toFixed(2)} to the power x`}
        fns={[
          { f: (x) => 1 + x, color: 'muted', width: 1.5, dash: [6, 6] },
          { f: (x) => a ** x, width: 4, glow: true },
        ]}
        lines={[{ x1: -1.4, y1: 1 - slope0 * 1.4, x2: 1.4, y2: 1 + slope0 * 1.4, color: 's2', width: 2.5 }]}
        points={[{ x: 0, y: 1, color: 's2' }]}
      />
      <Slider label="Growth factor a" value={a} min={0.3} max={3.5} step={0.01} onChange={setA} format={(v) => v.toFixed(2)} />
    </StepLayout>
  );
}
