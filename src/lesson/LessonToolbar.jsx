/**
 * Per-lesson toolbar: the Egyptian-Arabic toggle plus the two real-world
 * buttons — "🌍 فين بنشوف ده في الحقيقة؟" and "👷 المهندس بيستخدم ده فين؟" —
 * each opening a short sheet of applications.
 * @module lesson/LessonToolbar
 */
import { useEffect, useState } from 'react';
import { sound } from '../core/sound.js';
import { useLesson } from './LessonContext.jsx';
import MasryToggle from './MasryToggle.jsx';
import { ENGINEER_LABEL, REALITY_LABEL } from './strings.js';

function Sheet({ title, emoji, items, onClose, closeLabel, dir, lang }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="modal card lesson-sheet" onClick={(e) => e.stopPropagation()}>
        <h2 dir="rtl" lang="ar">
          <span aria-hidden="true">{emoji}</span> {title}
        </h2>
        <ul dir={dir} lang={lang}>
          {items.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>
        <div className="modal-actions">
          <button type="button" className="btn btn-primary btn-md" onClick={onClose} autoFocus>
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LessonToolbar() {
  const lesson = useLesson();
  const [open, setOpen] = useState(null);
  if (!lesson) return null;
  const { lesson: data, lang, dir, t } = lesson;
  const sheets = {
    reality: { emoji: '🌍', title: REALITY_LABEL, items: data.reality[lang] },
    engineer: { emoji: '👷', title: ENGINEER_LABEL, items: data.engineer[lang] },
  };
  const sheet = open && sheets[open];

  return (
    <div className="lesson-toolbar">
      <MasryToggle />
      {Object.entries(sheets).map(([key, s]) => (
        <button
          key={key}
          type="button"
          className="lesson-btn"
          dir="rtl"
          lang="ar"
          onClick={() => {
            sound.play('click');
            setOpen(key);
          }}
        >
          <span aria-hidden="true">{s.emoji}</span> {s.title}
        </button>
      ))}
      {sheet && <Sheet {...sheet} dir={dir} lang={lang} closeLabel={t.close} onClose={() => setOpen(null)} />}
    </div>
  );
}
