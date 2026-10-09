/**
 * "Living Lab" shelf on the map: lists only lessons that passed the publishing
 * gate (see engine/catalog/published.js). Shows nothing when none are published.
 * @module LabShelf
 */
import { useGame } from '../core/GameContext.jsx';
import { loadPublishedLessons } from '../engine/catalog/published.js';
import { loadReviewPreviewLessons } from '../engine/catalog/reviewPreview.js';

export default function LabShelf() {
  const { state } = useGame();
  const { lessons } = loadPublishedLessons();
  const review = loadReviewPreviewLessons();
  if (!lessons.length && !review.length) return null;
  return (
    <>
    {review.length > 0 && (
      <section aria-labelledby="review-title" className="lab-shelf review-shelf" dir="rtl" lang="ar">
        <h2 id="review-title" className="section-title">
          معاينة للمراجعة — مش منشور للطلبة
        </h2>
        <ul>
          {review.map((l) => (
            <li key={l.id}>
              <a className="lab-shelf-card" href={`#/review/${l.id}`}>
                <span className="lab-shelf-topic">{l.meta.topic} · الحالة: {l.review.status === 'approved' ? 'متوافق عليه' : 'في المراجعة'}</span>
                <b>{l.meta.title.ar}</b>
                <span>{l.meta.tagline.ar}</span>
                <span className="lab-shelf-meta">معاينة: التقدم مش بيتسجل · حوالي {l.meta.estimatedMinutes} دقيقة</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    )}
    {lessons.length > 0 && (
    <section aria-labelledby="lab-title" className="lab-shelf" dir="rtl" lang="ar">
      <h2 id="lab-title" className="section-title">
        المعمل الحي
      </h2>
      <ul>
        {lessons.map((l) => {
          const p = state.lessons?.[l.id];
          const done = l.objectives.filter((o) => p?.objectives?.[o.id]).length;
          return (
            <li key={l.id}>
              <a className="lab-shelf-card" href={`#/lab/${l.id}`}>
                <span className="lab-shelf-topic">{l.meta.topic}</span>
                <b>{l.meta.title.ar}</b>
                <span>{l.meta.tagline.ar}</span>
                <span className="lab-shelf-meta">
                  {p?.completed ? 'خلّصته' : `${done}/${l.objectives.length} أهداف`} · حوالي {l.meta.estimatedMinutes} دقيقة
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
    )}
    </>
  );
}
