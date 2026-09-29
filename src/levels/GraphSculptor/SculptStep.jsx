/**
 * Generic Graph Sculptor step driven by a config object:
 * an optional prediction question, then one or more sculpting challenges
 * (each with its own target), then the insight and the equation reveal.
 * @module GraphSculptor/SculptStep
 */
import { useCallback, useState } from 'react';
import StepLayout from '../../components/StepLayout.jsx';
import Choices from '../../components/Choices.jsx';
import Checklist from '../../components/Checklist.jsx';
import Plot from '../../components/Plot.jsx';
import Sculptor, { BASES } from './Sculptor.jsx';

export default function SculptStep({ api, config }) {
  const { eyebrow, predict, challenges, insight, formula, hint, sub } = config;
  const [predicted, setPredicted] = useState(!predict);
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(0);
  const done = finished === challenges.length;
  const current = challenges[Math.min(index, challenges.length - 1)];

  const onMatch = useCallback(() => {
    api.answer(true);
    setFinished((n) => n + 1);
    if (index + 1 < challenges.length) setTimeout(() => setIndex((i) => i + 1), 1100);
  }, [api, index, challenges.length]);

  const prompt = !predicted ? predict.question : done ? config.donePrompt || 'Sculpted!' : current.prompt;

  return (
    <StepLayout
      api={api}
      eyebrow={eyebrow}
      prompt={prompt}
      sub={predicted ? sub : predict.sub}
      hint={predicted ? hint : predict.hint}
      done={done}
      insight={insight}
      formula={formula}
      side={
        predicted && challenges.length > 1 ? (
          <Checklist items={challenges.map((c, i) => ({ label: c.label, done: i < finished }))} />
        ) : undefined
      }
    >
      {!predicted ? (
        <>
          <Plot
            x={BASES[predict.base].x}
            y={BASES[predict.base].y}
            height={260}
            ariaLabel="The starting curve"
            fns={[{ f: BASES[predict.base].f, width: 3.5 }]}
          />
          <Choices
            api={api}
            options={predict.options}
            correct={predict.correct}
            size="lg"
            onSolved={() => setTimeout(() => setPredicted(true), 700)}
          />
        </>
      ) : (
        <Sculptor
          key={index}
          base={current.base}
          controls={current.controls}
          target={current.target}
          showEquation={current.showEquation}
          onMatch={onMatch}
        />
      )}
    </StepLayout>
  );
}
