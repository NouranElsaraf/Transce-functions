/**
 * Lock 2 — The jar. A classic doubling riddle solved by thinking backwards.
 * @module EscapeRoom/LockJar
 */
import { useState } from 'react';
import Choices from '../../components/Choices.jsx';
import LockFrame from './LockFrame.jsx';

export default function LockJar({ api }) {
  const [done, setDone] = useState(false);
  return (
    <LockFrame
      index={1}
      api={api}
      done={done}
      eyebrow="The vault · Lock 2"
      prompt="Glowing bacteria double every minute. The jar is completely full at 12:00. When was it half full?"
      hint="Run the clock backwards one minute. What does 'doubling' undo into?"
      insight={<>One doubling before full is half full: 11:59. With exponential growth, the last moments hold most of the action — just like day 30 in the Kingdom.</>}
    >
      <div className="jar" aria-hidden="true">
        <div className="jar-fill" />
      </div>
      <Choices
        api={api}
        columns={4}
        size="lg"
        correct="1159"
        onSolved={() => setDone(true)}
        options={[
          { id: '0600', label: '6:00', why: 'Half the time is not half the amount when things double.' },
          { id: '1130', label: '11:30', why: '30 minutes before full, it was 2³⁰ times smaller — a billionth!' },
          { id: '1159', label: '11:59' },
          { id: '1100', label: '11:00', why: 'An hour earlier is 60 halvings. Tiny!' },
        ]}
      />
    </LockFrame>
  );
}
