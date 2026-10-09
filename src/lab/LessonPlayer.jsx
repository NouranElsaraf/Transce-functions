/**
 * Generic lesson renderer for validated engine lessons ("Living Lab").
 *
 * Renders stages in the schema's teaching order, looks up each interaction in
 * the registry, shows the stage's assessments, and tracks progress through the
 * shared lab reducer: in the game save for students, in local state for
 * previews (previews never write progress).
 *
 * A stage can be left once each of its assessments is resolved (a prediction
 * only needs an attempt). The lesson completes only when every objective has a
 * credited answer.
 * @module lab/LessonPlayer
 */
import { useEffect, useMemo, useReducer, useState } from 'react';
import { useGame } from '../core/GameContext.jsx';
import { labReducer, masteredAll } from '../engine/progress/labProgress.js';
import { contentHash } from '../engine/hash.js';
import { PHASES } from '../engine/schema/lessonSchema.js';
import { RENDERERS } from './registry.jsx';
import NumericAssessment from './assessments/NumericAssessment.jsx';
import ChoiceAssessment from './assessments/ChoiceAssessment.jsx';
import Notebook from './Notebook.jsx';
import Icon from '../components/Icon.jsx';

export const PHASE_LABEL = {
  problem: 'المشكلة',
  prediction: 'توقّع',
  experiment: 'تجربة',
  explanation: 'شرح بالصورة',
  equation: 'المعادلة',
  practice: 'تمرين',
  challenge: 'تحدي',
};

function useLessonProgress(lesson, mode) {
  const game = useGame();
  const [local, localDispatch] = useReducer(labReducer, {});
  const preview = mode !== 'student';
  const lessons = preview ? local : game.state.lessons;
  const dispatch = preview ? localDispatch : game.dispatch;
  return { entry: lessons[lesson.id], dispatch, preview, game };
}

export default function LessonPlayer({ lesson, mode = 'student', onExit, resolveAsset }) {
  const { entry, dispatch, preview, game } = useLessonProgress(lesson, mode);
  const hash = useMemo(() => contentHash(lesson), [lesson]);
  const stages = lesson.stages;
  const stageIndex = Math.min(entry?.stage ?? 0, stages.length - 1);
  const stage = stages[stageIndex];
  const objectiveIds = lesson.objectives.map((o) => o.id);
  const complete = Boolean(entry?.completed);
  const [retryKeys, setRetryKeys] = useState({});

  useEffect(() => {
    window.scrollTo?.({ top: 0, behavior: 'smooth' });
  }, [stageIndex]);

  const go = (i) => dispatch({ type: 'LAB_STAGE', lessonId: lesson.id, stage: i, contentHash: hash });

  const answer = (a) => (correct, value, seed, credited = correct) => {
    dispatch({ type: 'LAB_ANSWER', lessonId: lesson.id, assessmentId: a.id, objectiveIds: a.objectiveIds, correct, credited, value, seed });
    if (!preview) game.actions.answer(correct);
  };

  const stageAssessments = (stage.assessmentIds ?? []).map((id) => lesson.assessments.find((a) => a.id === id));
  const resolved = stageAssessments.every((a) => {
    const p = entry?.attempts?.[a.id];
    return p && (a.kind === 'prediction' ? p.tries > 0 : p.correct);
  });
  const last = stageIndex === stages.length - 1;
  const mastered = masteredAll(entry, objectiveIds);

  const finish = () => {
    if (mastered) dispatch({ type: 'LAB_COMPLETE', lessonId: lesson.id, objectiveIds });
  };

  const Renderer = stage.interaction ? RENDERERS[stage.interaction.type] : null;
  const phaseNow = PHASES.indexOf(stage.phase);

  return (
    <main className="lab" dir="rtl" lang="ar">
      {preview && (
        <div className="preview-banner" role="status">
          معاينة للمراجعة — الدرس ده مش منشور للطلبة، والتقدم هنا مش بيتسجل. ({lesson.provenance.origin === 'demo' ? 'محتوى تجريبي مكتوب يدويًا، مش مولّد بالذكاء الاصطناعي' : lesson.provenance.origin === 'ai-generated' ? `مسودة مولّدة بـ ${lesson.provenance.provider}/${lesson.provenance.model}` : 'محتوى مستورد'})
        </div>
      )}
      <header className="lab-head">
        {onExit && (
          <button type="button" className="lab-btn ghost" onClick={onExit}>
            <Icon name="right" size={18} /> رجوع
          </button>
        )}
        <div>
          <p className="lab-kicker">معمل حي · {lesson.meta.topic}</p>
          <h1>{lesson.meta.title.ar}</h1>
          <p className="lab-tagline">{lesson.meta.tagline.ar}</p>
        </div>
      </header>

      <nav className="phase-rail" aria-label="مراحل الدرس">
        <ol>
          {stages.map((s, i) => {
            const state = i === stageIndex ? 'now' : i <= (entry?.furthest ?? 0) ? 'seen' : 'later';
            return (
              <li key={s.id}>
                <button
                  type="button"
                  className={`phase is-${state}`}
                  aria-current={i === stageIndex ? 'step' : undefined}
                  disabled={i > (entry?.furthest ?? 0) && !game.state.teacher.enabled && !preview}
                  onClick={() => go(i)}
                >
                  <span className="phase-n" dir="ltr">{i + 1}</span>
                  <span className="phase-name">{PHASE_LABEL[s.phase]}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="lab-body">
        <section className="page" aria-labelledby="stage-title" key={stage.id}>
          <p className="page-phase">
            {PHASE_LABEL[stage.phase]} · {phaseNow + 1}/{PHASES.length}
          </p>
          <h2 id="stage-title">{stage.title.ar}</h2>
          <p className="page-body">{stage.body.ar}</p>

          {Renderer && (
            <div className="page-interaction">
              <Renderer params={stage.interaction.params} animation={lesson.animation} resolveAsset={resolveAsset} speechPreview={preview} />
            </div>
          )}

          {stageAssessments.map((a) => {
            const Comp = a.format === 'numeric' ? NumericAssessment : ChoiceAssessment;
            return (
              <Comp
                key={`${a.id}-${retryKeys[a.id] ?? 0}-${entry?.attempts?.[a.id]?.seed ?? 1}`}
                assessment={a}
                progress={entry?.attempts?.[a.id]}
                misconceptions={lesson.misconceptions}
                onAnswer={answer(a)}
                onNewSeed={(seed) => dispatch({ type: 'LAB_NEW_SEED', lessonId: lesson.id, assessmentId: a.id, seed })}
                onRetry={() => setRetryKeys((k) => ({ ...k, [a.id]: (k[a.id] ?? 0) + 1 }))}
              />
            );
          })}

          {stage.reveal && (resolved || stageAssessments.length === 0) && (
            <details className="reveal" open={stageAssessments.length > 0}>
              <summary>ليه كده؟</summary>
              <p>{stage.reveal.ar}</p>
            </details>
          )}

          <div className="page-nav">
            {stageIndex > 0 && (
              <button type="button" className="lab-btn ghost" onClick={() => go(stageIndex - 1)}>
                <Icon name="right" size={18} /> اللي قبله
              </button>
            )}
            {!last && (
              <button type="button" className="lab-btn" disabled={!resolved} onClick={() => go(stageIndex + 1)}>
                اللي بعده <Icon name="left" size={18} />
              </button>
            )}
            {last && !complete && (
              <button type="button" className="lab-btn" disabled={!resolved || !mastered} onClick={finish}>
                خلّص الدرس <Icon name="check" size={18} />
              </button>
            )}
            {!resolved && stageAssessments.length > 0 && <span className="lab-note">جاوب الأول عشان تكمل.</span>}
          </div>

          {last && resolved && !mastered && (
            <div className="todo-objectives" role="status">
              <p>لسه في أهداف محتاجة إجابة صح من أول مرة:</p>
              <ul>
                {lesson.objectives
                  .filter((o) => !entry?.objectives?.[o.id])
                  .map((o) => {
                    const where = stages.findIndex((s) => (s.assessmentIds ?? []).some((id) => lesson.assessments.find((a) => a.id === id)?.objectiveIds.includes(o.id)));
                    return (
                      <li key={o.id}>
                        {o.text.ar}{' '}
                        {where >= 0 && (
                          <button type="button" className="lab-btn ghost small" onClick={() => go(where)}>
                            ارجع لـ «{stages[where].title.ar}»
                          </button>
                        )}
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}

          {complete && (
            <section className="complete" aria-labelledby="done-title">
              <h2 id="done-title">خلّصت الدرس</h2>
              <p>كل الأهداف اتحققت بإجابات من تفكيرك:</p>
              <ul className="objective-list">
                {lesson.objectives.map((o) => (
                  <li key={o.id} className="is-done">
                    {o.text.ar}
                  </li>
                ))}
              </ul>
              <h3>أشهر الأخطاء في الموضوع ده</h3>
              <ul className="misconception-list">
                {lesson.misconceptions.slice(0, 3).map((m) => (
                  <li key={m.id}>
                    <b>{m.text.ar}</b> {m.why.ar}
                  </li>
                ))}
              </ul>
              {onExit && (
                <button type="button" className="lab-btn" onClick={onExit}>
                  ارجع للخريطة
                </button>
              )}
            </section>
          )}
        </section>

        <Notebook lesson={lesson} entry={entry} />
      </div>
    </main>
  );
}
