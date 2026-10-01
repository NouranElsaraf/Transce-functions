/**
 * Discovery flow strip (Observe → Predict → Interact → Reveal the math) plus the
 * step's "Ask yourself" question, shown *before* any explanation.
 * @module lesson/DiscoveryPrompt
 */
import { useLesson } from './LessonContext.jsx';

export default function DiscoveryPrompt({ done }) {
  const lesson = useLesson();
  if (!lesson?.step?.ask) return null;
  const { t, lang, dir, step } = lesson;
  return (
    <div className={`discovery ${done ? 'is-done' : ''}`} dir={dir} lang={lang}>
      <ol className="flow" aria-label="Discovery flow">
        {t.flow.map((label, i) => (
          <li key={label} className={done ? 'is-done' : i < 3 ? 'is-now' : ''}>
            <span className="flow-dot">{done ? '✓' : i + 1}</span>
            {label}
          </li>
        ))}
      </ol>
      {!done && (
        <p className="ask">
          <b>{t.ask}:</b> {step.ask[lang]}
        </p>
      )}
    </div>
  );
}
