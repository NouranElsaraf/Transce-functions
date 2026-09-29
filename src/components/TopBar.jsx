/**
 * Global header: brand, XP & rank, combo streak, stars and the settings toggles
 * (sound, theme, teacher mode).
 * @module TopBar
 */
import { useGame } from '../core/GameContext.jsx';
import { rankFor } from '../core/scoring.js';
import Icon from './Icon.jsx';
import ProgressBar from './ProgressBar.jsx';

function IconToggle({ icon, label, active, onClick }) {
  return (
    <button
      type="button"
      className={`icon-btn ${active ? 'is-active' : ''}`}
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
    >
      <Icon name={icon} size={20} />
    </button>
  );
}

export default function TopBar({ onHome }) {
  const { state, actions, resolvedTheme } = useGame();
  const { current, next, progress } = rankFor(state.xp);
  const totalStars = Object.values(state.levels).reduce((n, l) => n + (l.bestStars || 0), 0);
  const dark = resolvedTheme === 'dark';

  return (
    <header className="topbar">
      <button type="button" className="brand" onClick={onHome} aria-label="Back to the map">
        <svg viewBox="0 0 64 64" width="30" height="30" aria-hidden="true">
          <rect width="64" height="64" rx="16" fill="var(--c-accent)" />
          <path d="M8 44 C 20 44, 22 12, 32 12 S 44 44, 56 44" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
        </svg>
        <span className="brand-name">
          Transcendental <b>Quest</b>
        </span>
      </button>

      <div className="topbar-stats">
        <div className="xp" title={next ? `${next.xp - state.xp} XP to ${next.title}` : 'Max rank!'}>
          <div className="xp-row">
            <span className="xp-rank">{current.title}</span>
            <span className="xp-value" key={state.xp}>
              {state.xp} XP
            </span>
          </div>
          <ProgressBar value={progress} thin label="Rank progress" />
        </div>
        <div className={`chip combo ${state.combo >= 2 ? 'is-hot' : ''}`} title="Combo streak" aria-label={`Combo ${state.combo}`}>
          <Icon name="flame" size={16} /> {state.combo}×
        </div>
        <div className="chip" title="Stars earned" aria-label={`${totalStars} stars`}>
          <Icon name="star" size={16} /> {totalStars}
        </div>
      </div>

      <div className="topbar-actions">
        <IconToggle
          icon={state.settings.sound ? 'sound' : 'mute'}
          label={state.settings.sound ? 'Mute sound' : 'Unmute sound'}
          active={state.settings.sound}
          onClick={() => actions.setSetting('sound', !state.settings.sound)}
        />
        <IconToggle
          icon={dark ? 'sun' : 'moon'}
          label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          active={false}
          onClick={() => actions.setSetting('theme', dark ? 'light' : 'dark')}
        />
        <IconToggle
          icon="teacher"
          label={state.teacher.enabled ? 'Exit teacher mode' : 'Teacher mode'}
          active={state.teacher.enabled}
          onClick={() => actions.setTeacher('enabled', !state.teacher.enabled)}
        />
      </div>
    </header>
  );
}
