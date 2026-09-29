/**
 * Step 5 — Tune the wave. Beam length sets the amplitude and spin speed sets
 * how many waves fit in one turn. Match two ghost waves to earn y = A·sin(kθ).
 * @module LightBeam/StepTune
 */
import { useEffect, useRef, useState } from 'react';
import StepLayout from '../../components/StepLayout.jsx';
import Plot from '../../components/Plot.jsx';
import Slider from '../../components/Slider.jsx';
import Checklist from '../../components/Checklist.jsx';
import Readout from '../../components/Readout.jsx';
import M from '../../components/MathText.jsx';
import { degToRad } from '../../core/mathUtils.js';

const TARGETS = [
  { A: 2, k: 1, label: 'Match the tall wave' },
  { A: 0.5, k: 3, label: 'Match the small, fast wave' },
];

export default function StepTune({ api }) {
  const [A, setA] = useState(1);
  const [k, setK] = useState(1);
  const [index, setIndex] = useState(0);
  const matched = useRef(new Set());
  const [count, setCount] = useState(0);
  const done = count === TARGETS.length;
  const target = TARGETS[Math.min(index, TARGETS.length - 1)];
  const isMatch = A === target.A && k === target.k;

  useEffect(() => {
    if (isMatch && !matched.current.has(index)) {
      matched.current.add(index);
      api.answer(true);
      setCount((c) => c + 1);
      if (index + 1 < TARGETS.length) {
        setTimeout(() => {
          setIndex((i) => i + 1);
          setA(1);
          setK(1);
        }, 1100);
      }
    }
  }, [isMatch, index, api]);

  const wave = (a, kk) => (d) => a * Math.sin(degToRad(kk * d));

  return (
    <StepLayout
      api={api}
      eyebrow="Wave tuner"
      prompt={done ? 'Wave master.' : 'Tune the beam until your wave sits on the ghost.'}
      sub="Beam length: how far the wall is. Spin speed: turns of the light per full turn of the dial."
      hint="Count the ghost’s peaks in one 360° window, then read off its highest point."
      done={done}
      insight={
        <>
          A longer beam makes a taller wave: that is the <b>amplitude</b> A. Spinning k times faster squeezes k waves into
          360°, so the period shrinks to 360° ÷ k — exactly the Sculptor’s stretch and squeeze.
        </>
      }
      formula={<M block>y = A · sin(kθ)</M>}
      side={
        <>
          <Checklist items={TARGETS.map((t, i) => ({ label: t.label, done: i < count }))} />
          <Readout
            items={[
              { label: 'Amplitude', value: A },
              { label: 'Period', value: `${Math.round(360 / k)}°` },
            ]}
          />
        </>
      }
    >
      <Plot
        x={[-20, 740]}
        y={[-2.6, 2.6]}
        height={300}
        ariaLabel="Your wave and a target wave"
        ticks={{ formatX: (v) => `${v}°` }}
        fns={[
          { f: wave(target.A, target.k), color: isMatch ? 'good' : 'muted', width: 8, alpha: 0.35, dash: isMatch ? undefined : [2, 12] },
          { f: wave(A, k), color: isMatch ? 'good' : 's2', width: 3.5, glow: isMatch },
        ]}
      />
      <div className="controls">
        <Slider label="Beam length (amplitude)" value={A} min={0.5} max={2.5} step={0.5} onChange={setA} disabled={isMatch} />
        <Slider label="Spin speed" value={k} min={0.5} max={3} step={0.5} onChange={setK} format={(v) => `× ${v}`} disabled={isMatch} />
      </div>
    </StepLayout>
  );
}
