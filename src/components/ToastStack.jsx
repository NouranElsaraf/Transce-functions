/**
 * Stack of transient notifications (achievements, milestones).
 * @module ToastStack
 */
import { useGame } from '../core/GameContext.jsx';
import Icon from './Icon.jsx';

export default function ToastStack() {
  const { toasts } = useGame();
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.kind || 'info'}`}>
          <div className="toast-icon">
            <Icon name={t.icon || 'spark'} size={22} />
          </div>
          <div>
            {t.kind === 'achievement' && <div className="toast-eyebrow">Achievement unlocked</div>}
            <div className="toast-title">{t.title}</div>
            {t.body && <div className="toast-body">{t.body}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
