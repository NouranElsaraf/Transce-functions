/**
 * Multiple-choice predictor.
 *
 * Wrong picks shake, reveal their optional `why`, and lock so the player can try again;
 * the right pick glows and calls `onSolved`. Scoring goes through the step API,
 * so combos and stars "just work".
 *
 *   <Choices api={api} correct="b" onSolved={() => setDone(true)}
 *            options={[{ id: 'a', label: '4', why: 'That would be adding 2…' }, …]} />
 * @module Choices
 */
import { useState } from 'react';

export default function Choices({ options, correct, api, onSolved, onPick, columns, disabled = false, size = 'md' }) {
  const [wrong, setWrong] = useState([]);
  const [solved, setSolved] = useState(null);
  const [lastWrong, setLastWrong] = useState(null);
  const isCorrect = (opt) => (typeof correct === 'function' ? correct(opt) : opt.id === correct);

  const pick = (opt) => {
    if (solved || disabled || wrong.includes(opt.id)) return;
    const ok = isCorrect(opt);
    api?.answer(ok);
    onPick?.(opt, ok);
    if (ok) {
      setSolved(opt.id);
      onSolved?.(opt);
    } else {
      setWrong((w) => [...w, opt.id]);
      setLastWrong(opt);
    }
  };

  return (
    <div className="choices-wrap">
      <div
        className={`choices choices-${size}`}
        style={columns ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : undefined}
        role="group"
      >
        {options.map((opt) => {
          const state = solved === opt.id ? 'correct' : wrong.includes(opt.id) ? 'wrong' : solved ? 'muted' : '';
          return (
            <button
              key={opt.id}
              type="button"
              className={`choice ${state ? `is-${state}` : ''}`}
              onClick={() => pick(opt)}
              disabled={disabled || (Boolean(solved) && solved !== opt.id)}
              aria-pressed={solved === opt.id}
            >
              <span className="choice-label">{opt.label}</span>
              {opt.sub && <span className="choice-sub">{opt.sub}</span>}
            </button>
          );
        })}
      </div>
      {!solved && lastWrong?.why && (
        <p className="choice-why" key={lastWrong.id} role="status">
          {lastWrong.why}
        </p>
      )}
    </div>
  );
}
