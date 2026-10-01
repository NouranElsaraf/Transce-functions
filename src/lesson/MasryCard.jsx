/**
 * The older-sibling explanation in Egyptian Arabic. Before the step is solved it
 * only frames the problem (no spoilers); afterwards it explains the "why".
 * @module lesson/MasryCard
 */
import { useLesson } from './LessonContext.jsx';

export default function MasryCard({ done }) {
  const lesson = useLesson();
  if (!lesson?.masry || !lesson.step?.masry) return null;
  const [before, after] = lesson.step.masry;
  return (
    <div className={`masry-card ${done ? 'is-after' : ''}`} dir="rtl" lang="ar" role="note">
      <div className="masry-card-title">
        <span aria-hidden="true">🇪🇬</span> {done ? 'فهمت اللي حصل؟' : 'بص يا سيدي'}
      </div>
      <p>{done ? after : before}</p>
    </div>
  );
}
