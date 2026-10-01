/**
 * Runs one level: shows the header (title, step dots, progress), renders the
 * current step with its StepAPI, and shows the completion modal at the end.
 *
 * Also registers `skipStep` / `skipLevel` handlers for the Teacher panel.
 * @module LevelScreen
 */
import { useEffect, useMemo } from 'react';
import { useGame } from '../core/GameContext.jsx';
import Icon from '../components/Icon.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import StepDots from '../components/StepDots.jsx';
import LevelComplete from '../components/LevelComplete.jsx';
import { LessonProvider } from '../lesson/LessonContext.jsx';
import LessonToolbar from '../lesson/LessonToolbar.jsx';

export default function LevelScreen({ level, onExit, onNext, isLast, levelControls }) {
  const { state, actions } = useGame();
  const { meta, steps } = level;
  const { run, teacher } = state;
  const active = run?.levelId === meta.id;
  const stepIndex = active ? Math.min(run.step, steps.length - 1) : 0;

  useEffect(() => {
    actions.startLevel(meta.id);
  }, [meta.id, actions]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [stepIndex]);

  const api = useMemo(
    () => ({
      answer: actions.answer,
      hint: actions.hint,
      complete: () => {
        if (stepIndex >= steps.length - 1) actions.completeLevel(meta.id);
        else actions.advanceStep();
      },
      reveal: teacher.reveal,
      paused: teacher.paused,
      accent: meta.accent,
    }),
    [actions, stepIndex, steps.length, meta.id, meta.accent, teacher.reveal, teacher.paused],
  );

  useEffect(() => {
    levelControls.current = {
      skipStep: api.complete,
      skipLevel: () => actions.completeLevel(meta.id, { skipped: true, stars: 0 }),
    };
    return () => {
      levelControls.current = null;
    };
  }, [api, actions, meta.id, levelControls]);

  if (!active) return null;
  const Step = steps[stepIndex];
  const stepMeta = meta.steps[stepIndex];

  return (
    <main className="level" style={{ '--level-accent': meta.accent }}>
      <div className="level-head">
        <button type="button" className="icon-btn" onClick={onExit} aria-label="Back to map">
          <Icon name="left" />
        </button>
        <div className="level-head-title">
          <div className="eyebrow">
            Level {meta.order} · {meta.topic}
          </div>
          <h1>{meta.title}</h1>
        </div>
        <div className="level-head-steps">
          <StepDots steps={meta.steps} current={stepIndex} onJump={teacher.enabled ? actions.gotoStep : undefined} />
          <span className="step-count">
            Step {stepIndex + 1}/{steps.length} · {stepMeta.title}
          </span>
        </div>
      </div>
      <ProgressBar value={(stepIndex + (run.finished ? 1 : 0)) / steps.length} color={meta.accent} label="Level progress" />

      <LessonProvider levelId={meta.id} stepId={stepMeta.id}>
        <LessonToolbar />
        <div className="level-stage" key={`${meta.id}-${stepIndex}`}>
          <Step api={api} />
        </div>
      </LessonProvider>

      {run.finished && (
        <LevelComplete
          meta={meta}
          run={run}
          isLast={isLast}
          onNext={onNext}
          onMap={onExit}
          onReplay={() => actions.startLevel(meta.id)}
        />
      )}
    </main>
  );
}
