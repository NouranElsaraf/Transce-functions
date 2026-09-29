/**
 * Step 4 — The race. A neighbouring kingdom starts with 100 sacks and gains
 * 100 every day. Drag through the days and predict when doubling wins.
 * @module GrowingKingdom/StepRace
 */
import { useState } from 'react';
import StepLayout from '../../components/StepLayout.jsx';
import Plot from '../../components/Plot.jsx';
import Slider from '../../components/Slider.jsx';
import Choices from '../../components/Choices.jsx';
import Readout from '../../components/Readout.jsx';

const neighbour = (d) => 100 + 100 * d;
const you = (d) => 2 ** d;

export default function StepRace({ api }) {
  const [day, setDay] = useState(0);
  const [done, setDone] = useState(false);
  const leader = you(day) > neighbour(day) ? 'You' : 'Neighbour';

  return (
    <StepLayout
      api={api}
      eyebrow="The race"
      prompt="Your neighbour starts with 100 sacks and gains 100 every day. On which day do you overtake them?"
      sub="Drag through the days to watch the race, then commit."
      hint="Compare them on day 10 and day 11."
      done={done}
      insight={
        <>
          For ten days the steady neighbour leads — then doubling passes them and never looks back. <b>Any</b> exponential
          growth eventually beats <b>any</b> steady (linear) growth.
        </>
      }
      side={
        <>
          <Readout
            items={[
              { label: 'Day', value: day },
              { label: 'You (×2)', value: you(day).toLocaleString('en-US'), color: 'var(--c-series-1)' },
              { label: 'Neighbour (+100)', value: neighbour(day).toLocaleString('en-US'), color: 'var(--c-series-2)' },
            ]}
          />
          <span className={`tag ${leader === 'You' ? 'is-good' : ''}`}>Leader: {leader}</span>
          <Choices
            api={api}
            columns={2}
            correct="11"
            options={[
              { id: '5', label: 'Day 5', why: 'On day 5 you have 32 and they have 600.' },
              { id: '8', label: 'Day 8', why: 'On day 8 you have 256 and they have 900. Close, but not yet.' },
              { id: '11', label: 'Day 11' },
              { id: 'never', label: 'Never', why: 'Drag the slider further. Doubling has a surprise for you.' },
            ]}
            onSolved={() => {
              setDone(true);
              setDay(12);
            }}
          />
        </>
      }
    >
      <Plot
        x={[-0.5, 14]}
        y={[-150, 3000]}
        height={330}
        ariaLabel="Linear versus exponential growth"
        xLabel="day →"
        yLabel="↑ sacks"
        ticks={{ formatY: (v) => `${v / 1000}k` }}
        fns={[
          { f: neighbour, color: 's2', domain: [0, 14] },
          { f: you, color: 's1', domain: [0, 14], width: 3.5 },
        ]}
        lines={[{ x1: day, y1: -150, x2: day, y2: 3000, color: 'muted', width: 1, dash: [4, 4] }]}
        points={[
          { x: day, y: neighbour(day), color: 's2' },
          { x: day, y: you(day), color: 's1' },
        ]}
      />
      <div className="legend">
        <span>
          <i style={{ background: 'var(--c-series-1)' }} />
          You: double every day
        </span>
        <span>
          <i style={{ background: 'var(--c-series-2)' }} />
          Neighbour: +100 every day
        </span>
      </div>
      <Slider label="Day" value={day} min={0} max={14} step={1} onChange={setDay} />
    </StepLayout>
  );
}
