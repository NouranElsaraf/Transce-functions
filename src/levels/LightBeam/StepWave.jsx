/**
 * Step 3 — Draw the wave. Predict the shape the spot's height will trace, then
 * spin the light twice and watch the sine wave appear — and repeat.
 * @module LightBeam/StepWave
 */
import { useRef, useState } from 'react';
import StepLayout from '../../components/StepLayout.jsx';
import Choices from '../../components/Choices.jsx';
import M from '../../components/MathText.jsx';
import Sketch from '../../components/Sketch.jsx';
import { useAnimationFrame } from '../../hooks/useAnimationFrame.js';
import BeamScene from './BeamScene.jsx';
import WaveTrace from './WaveTrace.jsx';

const MAX = 720;
const SPEED = 120; // degrees per second

const SHAPES = [
  { id: 'line', label: <Sketch d="M4 26 L76 4" text="Straight line" />, why: 'The height goes up and then comes back down again.' },
  { id: 'zigzag', label: <Sketch d="M4 15 L22 4 L40 26 L58 4 L76 15" text="Zigzag" />, why: 'Close! But near the top the spot barely changes height. Does a zigzag slow down at its peaks?' },
  { id: 'wave', label: <Sketch d="M4 15 C 14 -2, 26 -2, 40 15 S 66 32, 76 15" text="Smooth wave" /> },
  { id: 'circle', label: <Sketch d="M40 3 a12 12 0 1 0 0.1 0" text="A circle" />, why: 'We plot height against angle turned — and the angle only ever increases.' },
];

export default function StepWave({ api }) {
  const [angle, setAngle] = useState(0);
  const ref = useRef(0);
  const [phase, setPhase] = useState('predict'); // predict | spin | question
  const [done, setDone] = useState(false);

  useAnimationFrame((dt) => {
    const next = Math.min(MAX, ref.current + SPEED * dt);
    ref.current = next;
    setAngle(next);
    if (next >= MAX) setPhase('question');
  }, phase === 'spin');

  return (
    <StepLayout
      api={api}
      eyebrow="Spin it"
      prompt={
        phase === 'predict'
          ? 'If we plot the spot’s height as the light spins, what shape appears?'
          : phase === 'spin'
            ? 'Watch the height…'
            : 'At 390°, the height is exactly the same as at…'
      }
      hint={phase === 'question' ? '390° is one full turn plus a bit. What does a full turn do?' : 'Near the top, the spot moves sideways more than upwards.'}
      done={done}
      insight={
        <>
          The height traces a smooth wave: the <b>sine</b> curve. Every 360° the light is back where it started, so the wave
          repeats forever — that is <b>periodic motion</b>.
        </>
      }
      formula={<M block>sin(θ + 360°) = sin θ</M>}
    >
      <div className="beam-grid">
        <BeamScene angle={angle % 360} showHeight height={300} />
        <WaveTrace angle={angle} max={MAX} height={300} />
      </div>
      {phase === 'predict' && (
        <Choices api={api} options={SHAPES} correct="wave" onSolved={() => setTimeout(() => setPhase('spin'), 600)} />
      )}
      {phase === 'question' && !done && (
        <Choices
          api={api}
          columns={4}
          correct="30"
          options={[
            { id: '30', label: '30°' },
            { id: '90', label: '90°', why: 'At 90° the spot is at the very top. Is it at the top at 390°?' },
            { id: '195', label: '195°', why: 'Halfway there is not the same as a full turn.' },
            { id: '0', label: '0°', why: 'At 0° the height is 0. Take 360° off 390°.' },
          ]}
          onSolved={() => setDone(true)}
        />
      )}
    </StepLayout>
  );
}
