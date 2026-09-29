/**
 * Step 2 — One week. Predict day 7 before fast-forwarding. The tempting
 * linear guesses are there on purpose.
 * @module GrowingKingdom/StepWeek
 */
import { useState } from 'react';
import StepLayout from '../../components/StepLayout.jsx';
import Choices from '../../components/Choices.jsx';
import { useAnimationFrame } from '../../hooks/useAnimationFrame.js';
import { sound } from '../../core/sound.js';
import Granary from './Granary.jsx';
import DayBars from './DayBars.jsx';

const START = 4;
const TARGET = 7;

export default function StepWeek({ api }) {
  const [day, setDay] = useState(START);
  const [running, setRunning] = useState(false);
  const [solved, setSolved] = useState(false);
  const [acc, setAcc] = useState(0);
  const done = solved && day === TARGET;

  useAnimationFrame((dt) => {
    const next = acc + dt;
    if (next < 0.7) return setAcc(next);
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
      eyebrow="Fast-forward"
      prompt="It's day 4 and you have 16 sacks. What will you have by the end of the week (day 7)?"
      hint="Just double three more times: 16 → ? → ? → ?"
      done={done}
      insight={
        <>
          Our instinct is to add: 16 + 4 + 4 + 4. But doubling three times means ×2×2×2 = <b>×8</b>. Multiplying repeatedly
          outruns adding very quickly.
        </>
      }
      side={
        !solved ? (
          <Choices
            api={api}
            columns={2}
            size="lg"
            correct="128"
            options={[
              { id: '28', label: '28', why: 'That is adding 4 a day. Doubling adds more each day.' },
              { id: '40', label: '40', why: 'That is adding the same jump each day. The jump itself doubles!' },
              { id: '64', label: '64', why: 'That is day 6. One more morning to go.' },
              { id: '128', label: '128' },
            ]}
            onSolved={() => {
              setSolved(true);
              setRunning(true);
            }}
          />
        ) : (
          <DayBars days={day} value={(d) => 2 ** d} highlight={day} height={240} />
        )
      }
    >
      <Granary count={2 ** day} day={day} />
    </StepLayout>
  );
}
