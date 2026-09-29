/**
 * Step 1 — Day by day. The player presses "next morning" themselves and
 * watches 1 → 2 → 4 → 8, then predicts day 4.
 * @module GrowingKingdom/StepDouble
 */
import { useState } from 'react';
import StepLayout from '../../components/StepLayout.jsx';
import Button from '../../components/Button.jsx';
import Choices from '../../components/Choices.jsx';
import { sound } from '../../core/sound.js';
import Granary from './Granary.jsx';

const PREDICT_AT = 3;

export default function StepDouble({ api }) {
  const [day, setDay] = useState(0);
  const [done, setDone] = useState(false);
  const count = 2 ** day;
  const predicting = day === PREDICT_AT && !done;

  return (
    <StepLayout
      api={api}
      eyebrow="Your kingdom"
      prompt={predicting ? 'Before you look: how many sacks will you have tomorrow?' : 'You own one sack of magic grain. Each morning, it doubles.'}
      sub={predicting ? undefined : 'Press the button to wake up to a new day.'}
      hint="Doubling means the same as having today's amount twice."
      done={done}
      insight={
        <>
          Every morning you <b>multiply</b> by 2 — you never add a fixed amount. The jump from day to day keeps getting
          bigger: +1, +2, +4, +8…
        </>
      }
      side={
        <>
          {!predicting && !done && (
            <Button
              size="lg"
              icon="sun"
              onClick={() => {
                sound.play('tick');
                setDay((d) => d + 1);
              }}
            >
              Next morning
            </Button>
          )}
          {predicting && (
            <Choices
              api={api}
              columns={2}
              size="lg"
              correct="16"
              options={[
                { id: '10', label: '10', why: 'That adds 2, like the first morning. But the gain grows every day.' },
                { id: '12', label: '12', why: 'That adds 4 — the size of the last jump. Doubling makes the next jump bigger.' },
                { id: '16', label: '16' },
                { id: '11', label: '11', why: 'Try thinking: tomorrow = today × 2.' },
              ]}
              onSolved={() => {
                setDay(PREDICT_AT + 1);
                setDone(true);
              }}
            />
          )}
          <ol className="day-log">
            {Array.from({ length: day + 1 }, (_, d) => (
              <li key={d}>
                <span>Day {d}</span>
                <b>{2 ** d}</b>
                {d > 0 && <em>+{2 ** (d - 1)}</em>}
              </li>
            ))}
          </ol>
        </>
      }
    >
      <Granary count={count} day={day} />
    </StepLayout>
  );
}
