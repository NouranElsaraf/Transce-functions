/**
 * Real-life-first bridge shown right before a formula: why we need it, an
 * everyday example and an engineering example. The equation then reads as
 * the conclusion.
 * @module lesson/RealityBridge
 */
import { useLesson } from './LessonContext.jsx';

export default function RealityBridge() {
  const lesson = useLesson();
  if (!lesson?.step?.bridge) return null;
  const { t, lang, dir, step } = lesson;
  const [why, everyday, engineering] = step.bridge[lang];
  return (
    <div className="bridge" dir={dir} lang={lang}>
      <div className="bridge-title">{t.bridgeTitle}</div>
      <dl>
        <div>
          <dt>❓ {t.why}</dt>
          <dd>{why}</dd>
        </div>
        <div>
          <dt>🏠 {t.everyday}</dt>
          <dd>{everyday}</dd>
        </div>
        <div>
          <dt>⚙️ {t.engineering}</dt>
          <dd>{engineering}</dd>
        </div>
      </dl>
      <div className="bridge-then">{t.thenMath}</div>
    </div>
  );
}
