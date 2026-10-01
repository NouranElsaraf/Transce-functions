/**
 * "🇪🇬 اشرحها بالمصري" switch. Turns on Egyptian-Arabic explanations and
 * switches all lesson-companion content to Arabic. Persisted in settings.
 * @module lesson/MasryToggle
 */
import { sound } from '../core/sound.js';
import { useLessonLang } from './LessonContext.jsx';
import { MASRY_LABEL } from './strings.js';

export default function MasryToggle({ compact = false }) {
  const { masry, setMasry } = useLessonLang();
  return (
    <button
      type="button"
      className={`masry-toggle ${masry ? 'is-on' : ''} ${compact ? 'is-compact' : ''}`}
      aria-pressed={masry}
      lang="ar"
      dir="rtl"
      onClick={() => {
        sound.play('click');
        setMasry(!masry);
      }}
    >
      <span aria-hidden="true">🇪🇬</span>
      <span>{MASRY_LABEL}</span>
      <span className="masry-switch" aria-hidden="true" />
    </button>
  );
}
