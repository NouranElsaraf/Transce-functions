/**
 * Row of dots showing progress through a level's steps.
 * Completed dots fill, the current one pulses. Teacher mode makes them clickable.
 * @module StepDots
 */
export default function StepDots({ steps, current, onJump }) {
  return (
    <ol className="step-dots" aria-label="Level steps">
      {steps.map((s, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'todo';
        return (
          <li key={s.id}>
            <button
              type="button"
              className={`step-dot is-${state}`}
              title={s.title}
              aria-label={`Step ${i + 1}: ${s.title}${state === 'done' ? ' (done)' : ''}`}
              aria-current={state === 'current' ? 'step' : undefined}
              disabled={!onJump}
              onClick={() => onJump?.(i)}
            />
          </li>
        );
      })}
    </ol>
  );
}
