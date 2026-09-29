/**
 * Floating control panel for instructors.
 *
 *  - Pause / resume every animation in the app
 *  - Draw on top of anything (ink overlay) and clear it
 *  - Reveal explanations instantly (and skip steps)
 *  - Skip the current level, jump to any step (via the step dots)
 *  - Reset all progress
 *
 * Teacher mode also unlocks every level on the map.
 * @module TeacherPanel
 */
import { useState } from 'react';
import { useGame } from '../core/GameContext.jsx';
import Icon from './Icon.jsx';

function Tool({ icon, label, onClick, active, danger }) {
  return (
    <button
      type="button"
      className={`tool ${active ? 'is-active' : ''} ${danger ? 'is-danger' : ''}`}
      onClick={onClick}
      aria-pressed={active}
    >
      <Icon name={icon} size={18} />
      <span>{label}</span>
    </button>
  );
}

export default function TeacherPanel({ levelControls, inLevel, onClearInk }) {
  const { state, actions, pushToast } = useGame();
  const { teacher } = state;
  const [confirmReset, setConfirmReset] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  if (!teacher.enabled) return null;

  return (
    <aside className={`teacher-panel ${collapsed ? 'is-collapsed' : ''}`} aria-label="Teacher tools">
      <button type="button" className="teacher-head" onClick={() => setCollapsed((c) => !c)} aria-expanded={!collapsed}>
        <Icon name="teacher" size={18} /> Teacher Mode
        <Icon name={collapsed ? 'right' : 'close'} size={16} className="teacher-toggle" />
      </button>
      {!collapsed && (
        <div className="teacher-tools">
          <Tool
            icon={teacher.paused ? 'play' : 'pause'}
            label={teacher.paused ? 'Resume' : 'Pause'}
            active={teacher.paused}
            onClick={() => actions.setTeacher('paused', !teacher.paused)}
          />
          <Tool icon="pen" label="Draw" active={teacher.drawing} onClick={() => actions.setTeacher('drawing', !teacher.drawing)} />
          <Tool icon="eraser" label="Clear ink" onClick={onClearInk} />
          <Tool icon="reveal" label="Reveal" active={teacher.reveal} onClick={() => actions.setTeacher('reveal', !teacher.reveal)} />
          {inLevel && <Tool icon="skip" label="Next step" onClick={() => levelControls.current?.skipStep()} />}
          {inLevel && <Tool icon="check" label="Skip level" onClick={() => levelControls.current?.skipLevel()} />}
          <Tool
            icon="reset"
            label={confirmReset ? 'Sure? Tap again' : 'Reset all'}
            danger
            onClick={() => {
              if (!confirmReset) {
                setConfirmReset(true);
                setTimeout(() => setConfirmReset(false), 3000);
                return;
              }
              actions.resetProgress();
              setConfirmReset(false);
              pushToast({ title: 'Progress reset', body: 'XP, stars and achievements cleared.', icon: 'reset' });
            }}
          />
          <p className="teacher-note">All levels are unlocked. Tap step dots to jump.</p>
        </div>
      )}
    </aside>
  );
}
