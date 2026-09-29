/**
 * Step 1 — Photo finish. Watch the car drive, then study four "long-exposure
 * photos" and guess which moment was fastest. The trail length is the clue.
 * @module SpeedDetective/StepWatch
 */
import { useState } from 'react';
import StepLayout from '../../components/StepLayout.jsx';
import Button from '../../components/Button.jsx';
import Choices from '../../components/Choices.jsx';
import { useAnimationFrame } from '../../hooks/useAnimationFrame.js';
import Road from './Road.jsx';
import { DURATION, position } from './trip.js';

const PLAYBACK_SPEED = 2; // simulated seconds per real second
const EXPOSURE = 0.6; // seconds captured in each photo
const PHOTOS = [
  { id: 'A', t: 2 },
  { id: 'B', t: 5.5 },
  { id: 'C', t: 7.2 },
  { id: 'D', t: 9 },
];

const trailFor = (t) => Array.from({ length: 7 }, (_, i) => position(t - EXPOSURE + (i * EXPOSURE) / 6));

export default function StepWatch({ api }) {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [watched, setWatched] = useState(false);
  const [done, setDone] = useState(false);

  useAnimationFrame((dt) => {
    setT((prev) => {
      const next = prev + dt * PLAYBACK_SPEED;
      if (next >= DURATION) {
        setPlaying(false);
        setWatched(true);
        return DURATION;
      }
      return next;
    });
  }, playing);

  return (
    <StepLayout
      api={api}
      eyebrow="Case #1"
      prompt={watched ? 'Which photo caught the car at its fastest?' : 'A car races down the road. Watch closely.'}
      sub={
        watched
          ? 'Each photo is a long exposure: it shows where the car was during the same 0.6 seconds.'
          : 'Press play. You will be asked about it afterwards.'
      }
      hint="Every photo lasts exactly the same time. In which photo did the car cover the most road?"
      done={done}
      insight={
        <>
          The longest trail wins: in the same 0.6 s, the car at <b>C</b> covered the most metres. Speed is simply{' '}
          <i>how much position changes per second</i>.
        </>
      }
    >
      <Road s={position(t)} trail={playing ? trailFor(t) : []} height={130} />
      <div className="row">
        <Button
          icon={t >= DURATION ? 'replay' : 'play'}
          variant={watched ? 'secondary' : 'primary'}
          size="lg"
          onClick={() => {
            if (t >= DURATION) setT(0);
            setPlaying(true);
          }}
          disabled={playing}
        >
          {watched ? 'Replay' : 'Play'}
        </Button>
        <span className="muted">t = {t.toFixed(1)} s</span>
      </div>

      {watched && (
        <>
          <div className="photo-strip">
            {PHOTOS.map((p) => (
              <Road
                key={p.id}
                s={position(p.t)}
                trail={trailFor(p.t)}
                height={78}
                markers={false}
                label={`Photo ${p.id}`}
              />
            ))}
          </div>
          <Choices
            api={api}
            columns={4}
            size="lg"
            correct="C"
            onSolved={() => setDone(true)}
            options={PHOTOS.map((p) => ({
              id: p.id,
              label: p.id,
              why:
                p.id === 'B'
                  ? 'Close! B is quick — but compare its trail with C carefully.'
                  : 'Look at the trail length: that is how far the car moved in 0.6 s.',
            }))}
          />
        </>
      )}
    </StepLayout>
  );
}
