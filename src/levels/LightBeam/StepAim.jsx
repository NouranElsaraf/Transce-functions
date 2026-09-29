/**
 * Step 1 — Aim. The light is off. The player taps the wall where they think the
 * spot will land after a given turn, then switches the light on to check.
 * @module LightBeam/StepAim
 */
import { useRef, useState } from 'react';
import StepLayout from '../../components/StepLayout.jsx';
import Button from '../../components/Button.jsx';
import Checklist from '../../components/Checklist.jsx';
import Slider from '../../components/Slider.jsx';
import { useAnimationFrame } from '../../hooks/useAnimationFrame.js';
import { sound } from '../../core/sound.js';
import BeamScene from './BeamScene.jsx';

const ROUNDS = [
  { target: 90, say: 'a quarter turn anticlockwise (90°)' },
  { target: 225, say: '225° — more than half a turn' },
  { target: 300, say: '300° — almost all the way round' },
];
const TOLERANCE = 20;
const TURN_SPEED = 160; // degrees per second

const angleDiff = (a, b) => Math.abs(((a - b + 540) % 360) - 180);

export default function StepAim({ api }) {
  const [round, setRound] = useState(0);
  const [angle, setAngle] = useState(0);
  const angleRef = useRef(0);
  const [guess, setGuess] = useState(null);
  const [phase, setPhase] = useState('guess'); // guess | turning | result
  const [results, setResults] = useState([]);
  const { target, say } = ROUNDS[Math.min(round, ROUNDS.length - 1)];
  const done = results.length === ROUNDS.length;

  // Side effects stay outside state updaters (StrictMode may call updaters twice).
  useAnimationFrame((dt) => {
    if (angleRef.current >= target) return;
    const next = Math.min(target, angleRef.current + TURN_SPEED * dt);
    angleRef.current = next;
    setAngle(next);
    if (next >= target) {
      const ok = angleDiff(guess, target) <= TOLERANCE;
      api.answer(ok);
      setResults((r) => [...r, ok]);
      setPhase('result');
    }
  }, phase === 'turning');

  const lastOk = results[results.length - 1];

  return (
    <StepLayout
      api={api}
      eyebrow="Round room"
      prompt={done ? 'Sharp aim!' : `The flashlight will turn ${say}. Tap the wall where the light will land.`}
      sub="Angles start at the right-hand side (0°) and go anticlockwise."
      hint="90° is straight up, 180° points left, 270° points straight down."
      done={done}
      insight={
        <>
          Every angle points to exactly one spot on the wall. A full turn is 360° and brings you back to the start — the
          same spot, over and over.
        </>
      }
      side={
        <>
          <Checklist items={ROUNDS.map((r, i) => ({ label: `Land the light at ${r.target}°`, done: results[i] === true }))} />
          {phase === 'guess' && !done && (
            <Button
              size="lg"
              icon="bolt"
              disabled={guess == null}
              onClick={() => {
                sound.play('whoosh');
                setPhase('turning');
              }}
            >
              Switch on &amp; turn
            </Button>
          )}
          {phase === 'result' && !done && (
            <>
              <p className="callout">
                {lastOk ? 'Right on target!' : `Off by ${Math.round(angleDiff(guess, target))}°. Notice where ${target}° really is.`}
              </p>
              <Button
                size="lg"
                iconRight="right"
                onClick={() => {
                  setRound((r) => r + 1);
                  setAngle(0);
                  angleRef.current = 0;
                  setGuess(null);
                  setPhase('guess');
                }}
              >
                Next round
              </Button>
            </>
          )}
        </>
      }
    >
      <BeamScene
        angle={angle}
        beamOn={phase !== 'guess'}
        marks={guess != null ? [{ angle: guess, color: 's2', label: 'your guess' }] : []}
        onPointer={
          phase === 'guess' && !done
            ? (type, deg) => {
                if (type === 'down') {
                  sound.play('tick');
                  setGuess(deg);
                }
              }
            : undefined
        }
      />
      {phase === 'guess' && !done && (
        <Slider label="…or set your guess with the slider" value={guess ?? 0} min={0} max={359} step={1} onChange={setGuess} format={(v) => `${v}°`} />
      )}
    </StepLayout>
  );
}
