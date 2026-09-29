/**
 * Step 4 — The floor shadow. A second projection onto the floor draws another
 * wave. The player identifies it as the sine wave shifted a quarter turn: cosine.
 * @module LightBeam/StepCos
 */
import { useRef, useState } from 'react';
import StepLayout from '../../components/StepLayout.jsx';
import Choices from '../../components/Choices.jsx';
import Button from '../../components/Button.jsx';
import M from '../../components/MathText.jsx';
import { useAnimationFrame } from '../../hooks/useAnimationFrame.js';
import BeamScene from './BeamScene.jsx';
import WaveTrace from './WaveTrace.jsx';

const MAX = 720;
const SPEED = 110;

export default function StepCos({ api }) {
  const [angle, setAngle] = useState(0);
  const ref = useRef(0);
  const [spinning, setSpinning] = useState(true);
  const [done, setDone] = useState(false);

  useAnimationFrame((dt) => {
    const next = Math.min(MAX, ref.current + SPEED * dt);
    ref.current = next;
    setAngle(next);
    if (next >= MAX) setSpinning(false);
  }, spinning);

  return (
    <StepLayout
      api={api}
      eyebrow="A second shadow"
      prompt="The blue dot tracks where the spot is left–right. Compare its wave with the pink one."
      sub="Pink: height. Blue: sideways position (the floor shadow)."
      hint="Where is each wave at 0°? Where does the blue wave reach its top compared with the pink?"
      done={done}
      insight={
        <>
          The floor shadow is the <b>cosine</b>: the very same wave, a quarter turn (90°) ahead of sine. Together they pin the
          spot at (cos θ, sin θ) — and because it sits on a circle of radius 1, Pythagoras gives the identity below.
        </>
      }
      formula={
        <M block>
          cos<sup>2</sup>θ + sin<sup>2</sup>θ = 1
        </M>
      }
    >
      <div className="beam-grid">
        <BeamScene angle={angle % 360} showHeight showFloor height={320} />
        <div className="stack">
          <WaveTrace angle={angle} max={MAX} showCos height={260} />
          <div className="legend">
            <span>
              <i style={{ background: 'var(--c-series-2)' }} />
              height (sin)
            </span>
            <span>
              <i style={{ background: 'var(--c-series-5)' }} />
              sideways (cos)
            </span>
          </div>
          {!spinning && (
            <Button
              variant="secondary"
              icon="replay"
              onClick={() => {
                ref.current = 0;
                setAngle(0);
                setSpinning(true);
              }}
            >
              Spin again
            </Button>
          )}
        </div>
      </div>
      {!done && (
        <Choices
          api={api}
          correct="shift"
          options={[
            { id: 'shift', label: 'Same wave, a quarter turn earlier' },
            { id: 'flip', label: 'Same wave, upside down', why: 'At 0° pink is 0 and blue is at its top — that is not a flip.' },
            { id: 'fast', label: 'A wave twice as fast', why: 'Count the peaks in 360°: one each.' },
            { id: 'diff', label: 'A totally different shape', why: 'Look again: same height, same spacing, same curves.' },
          ]}
          onSolved={() => setDone(true)}
        />
      )}
    </StepLayout>
  );
}
