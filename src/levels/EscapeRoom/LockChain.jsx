/**
 * Lock 5 — Which curve? Three look-alikes near the middle; only one fits the
 * riddle's behaviour far from it: cosh.
 * @module EscapeRoom/LockChain
 */
import { useState } from 'react';
import Plot from '../../components/Plot.jsx';
import Choices from '../../components/Choices.jsx';
import LockFrame from './LockFrame.jsx';

const CURVES = [
  { id: 'A', f: (x) => 1 + (x * x) / 2, color: 's4', labelX: 3.6 },
  { id: 'B', f: Math.cosh, color: 's1', labelX: 2.75 },
  { id: 'C', f: (x) => 2 - Math.cos(x), color: 's3', labelX: 3.6 },
];

export default function LockChain({ api }) {
  const [done, setDone] = useState(false);
  return (
    <LockFrame
      index={4}
      api={api}
      done={done}
      eyebrow="The vault · Lock 5"
      prompt="“I am symmetric. I never dip below 1. Far from the middle I grow like an exponential.” Which curve am I?"
      hint="One curve repeats. One grows like x². Which one explodes?"
      insight={<>B is cosh: symmetric and at least 1 like the others, but far out it is basically half of eˣ — it explodes where the parabola only climbs.</>}
    >
      <Plot
        x={[-4.2, 4.2]}
        y={[-0.5, 9]}
        height={320}
        ariaLabel="Three curves labelled A, B and C"
        fns={CURVES.map((c) => ({ f: c.f, color: c.color, width: 3 }))}
        points={CURVES.map((c) => ({ x: c.labelX, y: c.f(c.labelX), color: c.color, label: c.id, r: 5 }))}
      />
      <Choices
        api={api}
        columns={3}
        size="lg"
        correct="B"
        onSolved={() => setDone(true)}
        options={[
          { id: 'A', label: 'A', why: 'A grows like a square: steady, never explosive.' },
          { id: 'B', label: 'B' },
          { id: 'C', label: 'C', why: 'C repeats forever — that is trigonometric behaviour, not exponential.' },
        ]}
      />
    </LockFrame>
  );
}
