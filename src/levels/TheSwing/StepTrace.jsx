/**
 * Step 2 — Pen on paper. A pen on the bob draws the angle over time.
 * The player recognises the wave from the Light Beam — and that it's cosine.
 * @module TheSwing/StepTrace
 */
import { useState } from 'react';
import StepLayout from '../../components/StepLayout.jsx';
import Plot from '../../components/Plot.jsx';
import Choices from '../../components/Choices.jsx';
import M from '../../components/MathText.jsx';
import Sketch from '../../components/Sketch.jsx';
import Frac from '../../components/Frac.jsx';
import { useAnimationFrame } from '../../hooks/useAnimationFrame.js';
import Pendulum from './Pendulum.jsx';
import { angleAt } from './pendulum.js';

const A = 30;
const WINDOW = 8;

export default function StepTrace({ api }) {
  const [time, setTime] = useState(0);
  const [done, setDone] = useState(false);
  useAnimationFrame((dt) => setTime((t) => t + dt));

  const start = Math.max(0, time - WINDOW);
  return (
    <StepLayout
      api={api}
      eyebrow="Pen on paper"
      prompt="A pen on the bob records its angle over time. Which wave is it drawing?"
      sub="Look closely at how the trace starts at t = 0."
      hint="At t = 0 the pendulum is held at the far right — its biggest angle. Which wave starts at its top?"
      done={done}
      insight={
        <>
          It’s the Light Beam wave again! Released from its highest point, the swing follows the <b>cosine</b> — just stretched
          to height 30° and a period of 2 s.
        </>
      }
      formula={
        <M block>
          θ(t) = A·cos
          <span className="up">(</span>
          <Frac top="2πt" bottom="T" />
          <span className="up">)</span>
        </M>
      }
    >
      <div className="beam-grid">
        <Pendulum angle={angleAt(time, A)} amplitude={A} height={280} timeLabel={`t = ${time.toFixed(1)} s`} />
        <Plot
          x={[start - 0.3, start + WINDOW]}
          y={[-42, 42]}
          height={280}
          ariaLabel="Angle of the pendulum over time"
          xLabel="time (s) →"
          yLabel="↑ angle (°)"
          fns={[{ f: (t) => angleAt(t, A), domain: [0, time], width: 3.5, color: 's5' }]}
          points={[{ x: time, y: angleAt(time, A), color: 's5', r: 6 }]}
        />
      </div>
      {!done && (
        <Choices
          api={api}
          correct="cos"
          options={[
            { id: 'sin', label: <Sketch d="M4 15 C 14 -2, 26 -2, 40 15 S 66 32, 76 15" text="Sine (starts in the middle)" />, why: 'Check t = 0: is the trace in the middle, or at the top?' },
            { id: 'cos', label: <Sketch d="M4 4 C 16 4, 24 26, 40 26 S 64 4, 76 4" text="Cosine (starts at the top)" /> },
            { id: 'exp', label: <Sketch d="M4 27 C 40 27, 60 20, 76 2" text="Exponential" />, why: 'This trace comes back down. Exponentials never turn around.' },
            { id: 'sq', label: <Sketch d="M4 3 Q 40 50 76 3" text="Parabola" />, why: 'A parabola turns once. This keeps turning, again and again.' },
          ]}
          onSolved={() => setDone(true)}
        />
      )}
    </StepLayout>
  );
}
