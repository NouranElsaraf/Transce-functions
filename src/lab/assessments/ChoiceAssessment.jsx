/**
 * Multiple-choice reasoning question. Each wrong option explains itself and,
 * when linked, names the misconception behind it. Only a correct FIRST pick
 * earns mastery credit (no credit for elimination); "حاول تاني" offers a fresh try.
 * @module lab/assessments/ChoiceAssessment
 */
import { useState } from 'react';

export default function ChoiceAssessment({ assessment, progress, onAnswer, misconceptions, onRetry }) {
  const [picked, setPicked] = useState([]);
  const solved = picked.some((id) => assessment.choice.options.find((o) => o.id === id)?.correct) || (progress?.credited && !picked.length);
  const last = assessment.choice.options.find((o) => o.id === picked[picked.length - 1]);
  const misconception = last?.misconceptionId && misconceptions.find((m) => m.id === last.misconceptionId);

  return (
    <fieldset className={`assess ${solved ? 'is-correct' : ''}`}>
      <legend className="assess-prompt">
        <span className="assess-kind">{assessment.kind === 'prediction' ? 'توقّع' : assessment.kind === 'transfer' ? 'طبّق' : 'فكّر'}</span>
        {assessment.prompt.ar}
      </legend>
      <div className="options">
        {assessment.choice.options.map((o) => {
          const state = picked.includes(o.id) ? (o.correct ? 'right' : 'wrong') : '';
          return (
            <button
              key={o.id}
              type="button"
              className={`option ${state ? `is-${state}` : ''}`}
              disabled={solved || picked.includes(o.id)}
              aria-pressed={picked.includes(o.id)}
              onClick={() => {
                onAnswer(o.correct, o.id, undefined, picked.length === 0);
                setPicked((p) => [...p, o.id]);
              }}
            >
              {o.text.ar}
            </button>
          );
        })}
      </div>
      <div aria-live="polite">
        {last && (
          <div className={`fb ${last.correct ? 'fb-right' : 'fb-wrong'}`}>
            <p>{last.feedback.ar}</p>
            {last.correct ? <p className="fb-explain">{assessment.feedback.correct.ar}</p> : <p className="fb-explain">{assessment.feedback.wrong.ar}</p>}
            {misconception && (
              <p className="fb-misconceptions">
                <b>غلطة شائعة: {misconception.text.ar}</b> {misconception.why.ar}
              </p>
            )}
          </div>
        )}
        {solved && picked.length > 1 && !progress?.credited && (
          <p className="fb-note">
            وصلت للإجابة بعد كذا محاولة — اقرا الشرح، وبعدين{' '}
            <button type="button" className="lab-btn ghost small" onClick={onRetry}>
              حاول تاني من الأول
            </button>
          </p>
        )}
      </div>
    </fieldset>
  );
}
