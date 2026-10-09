/**
 * Numeric question with units. The answer is computed by the engine (named
 * computation), checked within tolerance, and followed by an explanation.
 * "New values" challenges draw fresh numbers from a seed. A right answer earns
 * mastery credit only if the worked explanation was not shown yet for these values.
 * @module lab/assessments/NumericAssessment
 */
import { useId, useState } from 'react';
import { resolveNumeric } from '../../engine/schema/lessonSchema.js';
import { fillTemplate } from '../../engine/math/compute.js';
import { fmt, parseNumber, withinTolerance } from '../format.js';

export default function NumericAssessment({ assessment, progress, onAnswer, onNewSeed, misconceptions }) {
  const id = useId();
  const seed = progress?.seed ?? 1;
  const { value: answer, values } = resolveNumeric(assessment.numeric, seed);
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null); // { correct, value }
  const [hints, setHints] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const tries = progress?.tries ?? 0;
  const vars = { ...values, answer };
  const prompt = fillTemplate(assessment.prompt.ar, vars);
  const generated = Boolean(assessment.numeric.generator);

  const check = (e) => {
    e.preventDefault();
    const value = parseNumber(input);
    if (!Number.isFinite(value)) {
      setResult({ invalid: true });
      return;
    }
    const correct = withinTolerance(value, answer, assessment.numeric.tolerance);
    const credited = correct && !revealed;
    setResult({ correct, value, credited });
    onAnswer(correct, value, seed, credited);
    if (correct || assessment.kind === 'prediction' || tries + 1 >= 2) setRevealed(true);
  };

  const linked = (assessment.misconceptionIds ?? []).map((m) => misconceptions.find((x) => x.id === m)).filter(Boolean);
  const showExplain = result && !result.invalid && revealed;

  return (
    <form className={`assess ${result?.correct ? 'is-correct' : ''}`} onSubmit={check} noValidate>
      <p className="assess-kind">{assessment.kind === 'prediction' ? 'توقّع' : assessment.kind === 'transfer' ? 'طبّق' : 'فكّر'}</p>
      <label htmlFor={id} className="assess-prompt">
        {prompt}
      </label>
      <div className="numeric-row">
        <input
          id={id}
          className="numeric-input"
          inputMode="decimal"
          dir="ltr"
          autoComplete="off"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setResult(null);
          }}
          aria-describedby={`${id}-unit ${id}-fb`}
        />
        <span id={`${id}-unit`} className="unit">
          {assessment.numeric.unit.ar}
        </span>
        <button type="submit" className="lab-btn">
          اتأكد
        </button>
      </div>
      <div id={`${id}-fb`} aria-live="polite">
        {result?.invalid && <p className="fb fb-wrong">اكتب رقم بس (ممكن بالأرقام العربي).</p>}
        {result && !result.invalid && (
          <div className={`fb ${result.correct ? 'fb-right' : 'fb-wrong'}`}>
            <p>{result.correct ? assessment.feedback.correct.ar : assessment.feedback.wrong.ar}</p>
            {result.correct && !result.credited && assessment.kind !== 'prediction' && (
              <p className="fb-note">الإجابة دي اتحسبت بعد ما الشرح ظهر — جرّب {generated ? 'بأرقام جديدة' : 'مسألة جديدة'} عشان تتحسبلك.</p>
            )}
            {showExplain && (
              <p className="fb-explain">
                الإجابة: <b dir="ltr">{fmt(answer, 1)}</b> {assessment.numeric.unit.ar}
                {assessment.numeric.explain && <> — {fillTemplate(assessment.numeric.explain.ar, vars)}</>}
              </p>
            )}
            {!result.correct && linked.length > 0 && tries >= 1 && (
              <ul className="fb-misconceptions">
                {linked.map((m) => (
                  <li key={m.id}>
                    <b>{m.text.ar}</b> {m.why.ar}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      {(assessment.hints ?? []).length > 0 && !result?.correct && (
        <div className="hints">
          {assessment.hints.slice(0, hints).map((h) => (
            <p key={h.ar} className="hint-line">
              {fillTemplate(h.ar, vars)}
            </p>
          ))}
          {hints < assessment.hints.length && (
            <button type="button" className="lab-btn ghost small" onClick={() => setHints((n) => n + 1)}>
              تلميح {hints + 1}
            </button>
          )}
        </div>
      )}
      {generated && (result?.correct || tries >= 2) && (
        <button
          type="button"
          className="lab-btn ghost small"
          onClick={() => {
            onNewSeed(seed + 1 + Math.floor(Math.random() * 1000));
            setInput('');
            setResult(null);
            setHints(0);
            setRevealed(false);
          }}
        >
          أرقام جديدة
        </button>
      )}
    </form>
  );
}
