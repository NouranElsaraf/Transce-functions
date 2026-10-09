/**
 * "Living Lab" shelf on the map: lists only lessons that passed the publishing
 * gate (see engine/catalog/published.js). Shows nothing when none are published.
 * @module LabShelf
 */
import { useGame } from '../core/GameContext.jsx';
import { loadPublishedLessons } from '../engine/catalog/published.js';

export default function LabShelf() {
  const { state } = useGame();
  const { lessons } = loadPublishedLessons();
  if (!lessons.length) return null;
  return (
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
  );
}
