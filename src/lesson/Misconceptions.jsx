/**
 * End-of-lesson list of the 3 most common student mistakes and why each one is wrong.
 * @module lesson/Misconceptions
 */
import { lessonFor } from './registry.js';
import { useLessonLang } from './LessonContext.jsx';

export default function Misconceptions({ levelId }) {
  const { t, lang, dir } = useLessonLang();
  const lesson = lessonFor(levelId);
  if (!lesson?.misconceptions?.length) return null;
  return (
    <section className="misconceptions" dir={dir} lang={lang}>
      <div className="eyebrow">⚠️ {t.mistakes}</div>
      <ol>
        {lesson.misconceptions.map((m) => {
          const [mistake, why] = m[lang];
          return (
            <li key={m.en[0]}>
              <div className="mistake">✗ {mistake}</div>
              <div className="mistake-why">
                <b>{t.whyWrong}</b> {why}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
