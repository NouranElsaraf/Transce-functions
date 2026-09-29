/**
 * Lock 4 — Signal. Read a mystery wave's period straight off the graph.
 * @module EscapeRoom/LockWave
 */
import { useState } from 'react';
import Plot from '../../components/Plot.jsx';
import Choices from '../../components/Choices.jsx';
import { degToRad } from '../../core/mathUtils.js';
import LockFrame from './LockFrame.jsx';

const wave = (d) => 2 * Math.sin(degToRad(3 * d));

export default function LockWave({ api }) {
  const [done, setDone] = useState(false);
  return (
    <LockFrame
      index={3}
      api={api}
      done={done}
      eyebrow="The vault · Lock 4"
      prompt="The lock hums this signal. After how many degrees does it start repeating?"
      hint="Pick any peak and find the next identical peak."
      insight={<>Three full waves fit in 360°, so each one takes 120°: the spin was 3× faster than the plain sine.</>}
    >
      <Plot
        x={[-15, 375]}
        y={[-2.6, 2.6]}
        height={260}
        ariaLabel="A wave with three cycles in 360 degrees"
        ticks={{ formatX: (v) => `${v}°` }}
        fns={[{ f: wave, color: 's5', width: 3.5, glow: true }]}
      />
      <Choices
        api={api}
        columns={4}
        size="lg"
        correct="120"
        onSolved={() => setDone(true)}
        options={[
          { id: '60', label: '60°', why: '60° is peak to valley — half a wave.' },
          { id: '120', label: '120°' },
          { id: '180', label: '180°', why: 'Check: is the wave at 180° doing the same thing as at 0°, going the same way?' },
          { id: '360', label: '360°', why: 'It repeats sooner than a full turn. Count the peaks.' },
        ]}
      />
    </LockFrame>
  );
}
