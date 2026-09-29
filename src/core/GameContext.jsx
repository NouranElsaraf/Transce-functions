/**
 * React glue around the game reducer.
 *
 * Responsibilities:
 *  - hydrate state from localStorage and persist changes
 *  - apply the resolved theme to <html data-theme>
 *  - keep the sound engine in sync with the sound setting
 *  - evaluate achievements after every change and surface toasts
 *  - expose friendly action helpers (`answer`, `hint`, `completeLevel`, …)
 * @module GameContext
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { gameReducer, hydrate, persistable } from './gameReducer.js';
import { newlyUnlocked } from './achievements.js';
import { load, save } from './storage.js';
import { sound } from './sound.js';
import { confetti } from './confetti.js';
import { LEVEL_IDS } from '../levels/metaRegistry.js';

const GameContext = createContext(null);
const STORAGE_KEY = 'progress';

function useSystemDark() {
  const query = typeof window !== 'undefined' ? window.matchMedia?.('(prefers-color-scheme: dark)') : null;
  const [dark, setDark] = useState(Boolean(query?.matches));
  useEffect(() => {
    if (!query) return undefined;
    const onChange = (e) => setDark(e.matches);
    query.addEventListener?.('change', onChange);
    return () => query.removeEventListener?.('change', onChange);
  }, [query]);
  return dark;
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => hydrate(load(STORAGE_KEY, null)));
  const [toasts, setToasts] = useState([]);
  const announced = useRef(new Set());
  const systemDark = useSystemDark();
  const resolvedTheme = state.settings.theme === 'system' ? (systemDark ? 'dark' : 'light') : state.settings.theme;

  // Persist progress.
  useEffect(() => {
    save(STORAGE_KEY, persistable(state));
  }, [state]);

  // Theme.
  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
  }, [resolvedTheme]);

  // Sound.
  useEffect(() => {
    sound.setEnabled(state.settings.sound);
  }, [state.settings.sound]);

  const pushToast = useCallback((toast) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((t) => [...t, { id, ...toast }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), toast.duration ?? 3800);
  }, []);

  // Achievements.
  useEffect(() => {
    const fresh = newlyUnlocked(state, LEVEL_IDS).filter((a) => !announced.current.has(a.id));
    if (!fresh.length) return;
    fresh.forEach((a) => announced.current.add(a.id));
    fresh.forEach((a, i) => {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', id: a.id });
      setTimeout(() => {
        sound.play('achievement');
        pushToast({ kind: 'achievement', icon: a.icon, title: a.title, body: a.description });
      }, 600 + i * 700);
    });
  }, [state, pushToast]);

  const actions = useMemo(
    () => ({
      startLevel: (levelId) => dispatch({ type: 'START_LEVEL', levelId }),
      answer: (correct) => {
        dispatch({ type: 'ANSWER', correct });
        sound.play(correct ? 'correct' : 'wrong');
        return correct;
      },
      hint: () => dispatch({ type: 'USE_HINT' }),
      advanceStep: () => {
        sound.play('whoosh');
        dispatch({ type: 'ADVANCE_STEP' });
      },
      gotoStep: (step) => dispatch({ type: 'GOTO_STEP', step }),
      completeLevel: (levelId, opts = {}) => {
        dispatch({ type: 'COMPLETE_LEVEL', levelId, ...opts });
        if (!opts.skipped) {
          sound.play('levelUp');
          confetti({ count: 160 });
          setTimeout(() => confetti({ x: 0.2, y: 0.5, count: 60 }), 250);
          setTimeout(() => confetti({ x: 0.8, y: 0.5, count: 60 }), 400);
        }
      },
      setSetting: (key, value) => dispatch({ type: 'SET_SETTING', key, value }),
      setTeacher: (key, value) => dispatch({ type: 'SET_TEACHER', key, value }),
      resetProgress: () => dispatch({ type: 'RESET_PROGRESS' }),
      celebrate: (opts) => confetti(opts),
    }),
    [],
  );

  const value = useMemo(
    () => ({ state, dispatch, actions, toasts, pushToast, resolvedTheme }),
    [state, actions, toasts, pushToast, resolvedTheme],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

/** Access game state and actions. Must be used inside <GameProvider>. */
export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside <GameProvider>');
  return ctx;
}
