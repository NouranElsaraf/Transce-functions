/**
 * Step 2 — Build cosh. Two ingredients the player already knows: growth eˣ and
 * decay e⁻ˣ. Mix them with two sliders to match the chain (cosh), then sinh.
 * @module HyperbolicWorld/StepBuild
 */
import { useEffect, useRef, useState } from 'react';
import StepLayout from '../../components/StepLayout.jsx';
import Plot from '../../components/Plot.jsx';
import Slider from '../../components/Slider.jsx';
import Checklist from '../../components/Checklist.jsx';
import M from '../../components/MathText.jsx';
import Frac from '../../components/Frac.jsx';

const TARGETS = [
  { g: 0.5, d: 0.5, label: 'Match the hanging chain', name: 'cosh' },
  { g: 0.5, d: -0.5, label: 'Match the S-shaped ghost', name: 'sinh' },
];

export default function StepBuild({ api }) {
  const [g, setG] = useState(1);
  const [d, setD] = useState(0);
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);
  const seen = useRef(new Set());
  const target = TARGETS[Math.min(index, TARGETS.length - 1)];
  const isMatch = Math.abs(g - target.g) < 1e-9 && Math.abs(d - target.d) < 1e-9;
  const done = count === TARGETS.length;

  useEffect(() => {
    if (!isMatch || seen.current.has(index)) return;
    seen.current.add(index);
    api.answer(true);
    setCount((c) => c + 1);
    if (index + 1 < TARGETS.length) {
      setTimeout(() => {
        setIndex((i) => i + 1);
        setG(1);
        setD(0);
      }, 1200);
    }
  }, [isMatch, index, api]);

  const mix = (a, b) => (x) => a * Math.exp(x) + b * Math.exp(-x);

  return (
    <StepLayout
      api={api}
      eyebrow="Recipe"
      prompt={done ? 'Two new functions, built from old friends.' : 'Mix growth and decay until your curve sits on the ghost.'}
      sub={
        <>
          Growth <M>e<sup>x</sup></M> shoots up on the right; decay <M>e<sup>−x</sup></M> shoots up on the left.
        </>
      }
      hint={index === 0 ? 'The ghost is symmetric — so use equal amounts of each. How much makes its lowest point 1?' : 'An S-shape: growth on the right, the opposite of decay on the left.'}
      done={done}
      insight={
        <>
          The chain is the <b>average</b> of growth and decay: that’s cosh. Half their <b>difference</b> is sinh. Hyperbolic
          functions are just exponentials in disguise.
        </>
      }
      formula={
        <M block>
          cosh x = <Frac top={<>e<sup>x</sup> + e<sup>−x</sup></>} bottom="2" />
          &nbsp;&nbsp; sinh x = <Frac top={<>e<sup>x</sup> − e<sup>−x</sup></>} bottom="2" />
        </M>
      }
      side={
        <>
          <Checklist items={TARGETS.map((t, i) => ({ label: t.label, done: i < count }))} />
          <div className="live-eq">
            <M>
              y = {g}·e<sup>x</sup> {d < 0 ? '−' : '+'} {Math.abs(d)}·e<sup>−x</sup>
            </M>
          </div>
        </>
      }
    >
      <Plot
        x={[-3, 3]}
        y={[-4, 5]}
        height={330}
        ariaLabel="Mixing exponential growth and decay"
        fns={[
          { f: Math.exp, color: 's1', width: 1.5, dash: [4, 6], alpha: 0.6 },
          { f: (x) => Math.exp(-x), color: 's2', width: 1.5, dash: [4, 6], alpha: 0.6 },
          { f: mix(target.g, target.d), color: isMatch ? 'good' : 'muted', width: 8, alpha: 0.35, dash: isMatch ? undefined : [2, 12] },
          { f: mix(g, d), color: isMatch ? 'good' : 'accent', width: 3.5, glow: isMatch },
        ]}
      />
      <div className="controls">
        <Slider label="Amount of growth eˣ" value={g} min={-1} max={1} step={0.25} onChange={setG} color="var(--c-series-1)" disabled={isMatch} />
        <Slider label="Amount of decay e⁻ˣ" value={d} min={-1} max={1} step={0.25} onChange={setD} color="var(--c-series-2)" disabled={isMatch} />
      </div>
    </StepLayout>
  );
}
