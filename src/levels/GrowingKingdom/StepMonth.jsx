/**
 * Step 3 — One month. Predict day 30, then watch the counter explode.
 * The bar chart shows the first ~20 days are invisible next to the last few.
 * @module GrowingKingdom/StepMonth
 */
import { useState } from 'react';
import StepLayout from '../../components/StepLayout.jsx';
import Choices from '../../components/Choices.jsx';
import { useAnimationFrame } from '../../hooks/useAnimationFrame.js';
import { formatBig } from '../../core/mathUtils.js';
import { sound } from '../../core/sound.js';
import DayBars from './DayBars.jsx';

const START = 7;
const TARGET = 30;
const SECONDS_PER_DAY = 0.18;

export default function StepMonth({ api }) {
  const [day, setDay] = useState(START);
  const [running, setRunning] = useState(false);
  const [solved, setSolved] = useState(false);
  const [acc, setAcc] = useState(0);
  const done = solved && day === TARGET;

  useAnimationFrame((dt) => {
    const next = acc + dt;
    if (next < SECONDS_PER_DAY) return setAcc(next);
    setAcc(0);
    sound.play('tick');
    setDay((d) => {
      if (d + 1 >= TARGET) setRunning(false);
      return Math.min(d + 1, TARGET);
    });
  }, running);

  return (
    <StepLayout
      api={api}
      eyebrow="One month later"
      prompt="Keep doubling for a whole month. How many sacks on day 30?"
      sub="Go with your gut — then watch."
      hint="Ten doublings is about ×1000. A month has three sets of ten doublings."
      done={done}
      insight={
        <>
          Over a billion sacks — from one! On a normal scale the first 20 days are invisible, and the <b>last day alone</b>{' '}
          adds more than all previous days combined. That&apos;s exponential growth.
        </>
      }
    >
      <div className="month-counter card">
        <div className="eyebrow">Day {day}</div>
        <div className={`big-number ${running ? 'is-rolling' : ''}`}>{formatBig(2 ** day)}</div>
        <div className="muted">sacks{done && ' — roughly 27 tonnes of rice from a single grain'}</div>
      </div>
      {solved && <DayBars days={day} value={(d) => 2 ** d} highlight={day} height={220} labelEvery={5} />}
      {!solved && (
        <Choices
          api={api}
          columns={2}
          size="lg"
          correct="billion"
          options={[
            { id: '240', label: 'About 240', why: 'That is adding 8 a day. Remember: the amount doubles.' },
            { id: '900', label: 'About 900', why: 'Doubling gets you to ~1000 in just 10 days. We have 30.' },
            { id: 'million', label: 'About a million', why: 'That is only day 20. Ten more doublings to go…' },
            { id: 'billion', label: 'About a billion' },
          ]}
          onSolved={() => {
            setSolved(true);
            setRunning(true);
            sound.play('whoosh');
          }}
        />
      )}
    </StepLayout>
  );
}
