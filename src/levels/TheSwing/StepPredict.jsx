/**
 * Step 1 — Where will it be? Watch one swing (2 s), then for three moments in
 * time drag a ghost bob to your prediction and release the real pendulum.
 * @module TheSwing/StepPredict
 */
import { useRef, useState } from 'react';
import StepLayout from '../../components/StepLayout.jsx';
import Button from '../../components/Button.jsx';
import Checklist from '../../components/Checklist.jsx';
import { useAnimationFrame } from '../../hooks/useAnimationFrame.js';
import { clamp } from '../../core/mathUtils.js';
import { sound } from '../../core/sound.js';
import Pendulum from './Pendulum.jsx';
import { angleAt } from './pendulum.js';

const A = 30;
const TOLERANCE = 9;
const ROUNDS = [
  { t: 1, say: '1 second' },
  { t: 0.5, say: '0.5 seconds' },
  { t: 6, say: '6 seconds' },
];

export default function StepPredict({ api }) {
  const [phase, setPhase] = useState('intro'); // intro | watching | guess | running | result
  const [time, setTime] = useState(0);
  const timeRef = useRef(0);
  const [round, setRound] = useState(0);
  const [ghost, setGhost] = useState(null);
  const [results, setResults] = useState([]);
  const done = results.length === ROUNDS.length;
  const goal = phase === 'watching' ? 2 : ROUNDS[Math.min(round, ROUNDS.length - 1)].t;
  const speed = goal > 3 ? 3 : 1;

  useAnimationFrame((dt) => {
    const next = Math.min(goal, timeRef.current + dt * speed);
    timeRef.current = next;
    setTime(next);
    if (next < goal) return;
    if (phase === 'watching') {
      setPhase('guess');
      timeRef.current = 0;
      setTime(0);
      return;
    }
    const ok = Math.abs(ghost - angleAt(goal, A)) <= TOLERANCE;
    api.answer(ok);
    setResults((r) => [...r, ok]);
    setPhase('result');
  }, phase === 'watching' || phase === 'running');

  const current = ROUNDS[Math.min(round, ROUNDS.length - 1)];
  const prompt =
    phase === 'intro' || phase === 'watching'
      ? 'Meet the pendulum. Watch one full swing — there and back.'
      : done
        ? 'Fortune teller!'
        : `Drag the pink ghost to where the pendulum will be after ${current.say}.`;

  return (
    <StepLayout
      api={api}
      eyebrow="Tick, tock"
      prompt={prompt}
      sub={phase === 'intro' || phase === 'watching' ? 'It is released from the right and takes exactly 2 seconds to come back.' : 'One full swing (there and back) takes 2 seconds.'}
      hint="In 2 s it goes right → left → right. So 1 s is half of that, and 0.5 s is a quarter."
      done={done}
      insight={
        <>
          The swing is a perfect clock: every 2 seconds it is back where it started. Half a period puts it on the far side, a
          quarter puts it in the middle — and 6 s is just three full swings.
        </>
      }
      side={
        <>
          {phase !== 'intro' && phase !== 'watching' && (
            <Checklist items={ROUNDS.map((r, i) => ({ label: `After ${r.say}`, done: results[i] === true }))} />
          )}
          {phase === 'intro' && (
            <Button
              size="lg"
              icon="play"
              onClick={() => {
                timeRef.current = 0;
                setPhase('watching');
              }}
            >
              Release it
            </Button>
          )}
          {phase === 'guess' && (
            <Button
              size="lg"
              icon="play"
              disabled={ghost == null}
              onClick={() => {
                sound.play('whoosh');
                timeRef.current = 0;
                setTime(0);
                setPhase('running');
              }}
            >
              Release &amp; check
            </Button>
          )}
          {phase === 'result' && !done && (
            <>
              <p className="callout">{results[results.length - 1] ? 'Spot on!' : 'Not quite — see where it really ended up.'}</p>
              <Button
                size="lg"
                iconRight="right"
                onClick={() => {
                  setRound((r) => r + 1);
                  setGhost(null);
                  timeRef.current = 0;
                  setTime(0);
                  setPhase('guess');
                }}
              >
                Next prediction
              </Button>
            </>
          )}
        </>
      }
    >
      <Pendulum
        angle={angleAt(time, A)}
        amplitude={A}
        ghost={phase === 'intro' || phase === 'watching' ? null : ghost}
        timeLabel={`t = ${time.toFixed(1)} s`}
        onPointer={
          phase === 'guess'
            ? (type, deg, dragging) => {
                if (type === 'down' || dragging) setGhost(clamp(deg, -A - 5, A + 5));
              }
            : undefined
        }
      />
    </StepLayout>
  );
}
