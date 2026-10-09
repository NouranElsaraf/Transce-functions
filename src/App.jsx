/**
 * Application shell: a tiny screen router (map ↔ level) plus global overlays —
 * top bar, instant-feedback pill, toasts, the teacher panel and ink layer.
 * The current screen is mirrored into the URL hash so refresh/back work:
 *   #/level/<id>  original games · #/lab/<id> published engine lessons ·
 *   #/studio      local authoring studio (needs the studio server) ·
 *   #/review/<id> review preview (only in `npm run build:review` builds).
 * @module App
 */
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useGame } from './core/GameContext.jsx';
import { LEVELS, levelById } from './levels/registry.js';
import TopBar from './components/TopBar.jsx';
import ToastStack from './components/ToastStack.jsx';
import FeedbackPill from './components/FeedbackPill.jsx';
import TeacherPanel from './components/TeacherPanel.jsx';
import DrawingOverlay from './components/DrawingOverlay.jsx';
import Home from './screens/Home.jsx';
import LevelScreen from './screens/LevelScreen.jsx';
import { isUnlocked } from './core/gameReducer.js';
import LabScreen from './screens/LabScreen.jsx';

const Studio = lazy(() => import('./studio/Studio.jsx'));

const readHash = () => {
  const m = window.location.hash.match(/^#\/level\/([\w-]+)/);
  return m ? m[1] : null;
};

const readRoute = () => {
  const h = window.location.hash;
  const lab = h.match(/^#\/lab\/([\w-]+)/);
  if (lab) return { kind: 'lab', id: lab[1] };
  const review = h.match(/^#\/review\/([\w-]+)/);
  if (review) return { kind: 'review', id: review[1] };
  if (/^#\/studio/.test(h)) return { kind: 'studio' };
  return null;
};

export default function App() {
  const { state, actions } = useGame();
  const [levelId, setLevelId] = useState(readHash);
  const [route, setRoute] = useState(readRoute);
  const [inkClear, setInkClear] = useState(0);
  const levelControls = useRef(null);

  const ids = LEVELS.map((l) => l.meta.id);
  const index = ids.indexOf(levelId);
  const level = index >= 0 && isUnlocked(state, ids, index) ? levelById(levelId) : null;

  const go = useCallback((id) => {
    setLevelId(id);
    setRoute(null);
    window.location.hash = id ? `/level/${id}` : '/';
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    const onHash = () => {
      setLevelId(readHash());
      setRoute(readRoute());
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Shift+T toggles Teacher Mode; Space pauses while it's on.
  useEffect(() => {
    const onKey = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.shiftKey && e.key.toLowerCase() === 't') actions.setTeacher('enabled', !state.teacher.enabled);
      if (state.teacher.enabled && e.key === 'p') actions.setTeacher('paused', !state.teacher.paused);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [actions, state.teacher.enabled, state.teacher.paused]);

  return (
    <div className={`app ${state.teacher.paused ? 'is-paused' : ''}`}>
      <a
        href="#main"
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        Skip to content
      </a>
      <div className="bg-blobs" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <TopBar onHome={() => go(null)} />
      <div id="main" tabIndex={-1}>
        {route?.kind === 'studio' ? (
          <Suspense fallback={<p className="lab-note">بيحمّل الاستوديو…</p>}>
            <Studio onExit={() => go(null)} />
          </Suspense>
        ) : route?.kind === 'lab' ? (
          <LabScreen id={route.id} onExit={() => go(null)} />
        ) : route?.kind === 'review' ? (
          <LabScreen id={route.id} review onExit={() => go(null)} />
        ) : level ? (
          <LevelScreen
            key={level.meta.id}
            level={level}
            levelControls={levelControls}
            isLast={index === LEVELS.length - 1}
            onExit={() => go(null)}
            onNext={() => go(ids[index + 1])}
          />
        ) : (
          <Home onPlay={go} />
        )}
      </div>
      {state.teacher.paused && <div className="paused-badge">Paused</div>}
      <FeedbackPill />
      <ToastStack />
      <DrawingOverlay active={state.teacher.enabled && state.teacher.drawing} clearSignal={inkClear} />
      <TeacherPanel levelControls={levelControls} inLevel={Boolean(level)} onClearInk={() => setInkClear((n) => n + 1)} />
    </div>
  );
}
