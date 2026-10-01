/**
 * Provides the current level's lesson data and step id to everything inside a
 * level, plus the active companion language (Egyptian Arabic when "اشرحها
 * بالمصري" is on). Components outside a provider get `null` and render nothing,
 * so steps keep working on their own (e.g. in tests).
 * @module lesson/LessonContext
 */
import { createContext, useContext, useMemo } from 'react';
import { useGame } from '../core/GameContext.jsx';
import { lessonFor } from './registry.js';
import { STRINGS } from './strings.js';

const LessonContext = createContext(null);

export function LessonProvider({ levelId, stepId, children }) {
  const value = useMemo(() => ({ levelId, stepId }), [levelId, stepId]);
  return <LessonContext.Provider value={value}>{children}</LessonContext.Provider>;
}

/** Lesson language helpers; usable anywhere inside <GameProvider>. */
export function useLessonLang() {
  const { state, actions } = useGame();
  const masry = Boolean(state.settings.masry);
  const lang = masry ? 'ar' : 'en';
  return {
    masry,
    lang,
    t: STRINGS[lang],
    setMasry: (v) => actions.setSetting('masry', v),
    dir: masry ? 'rtl' : 'ltr',
  };
}

/** Current level + step lesson data, or null outside a level. */
export function useLesson() {
  const ctx = useContext(LessonContext);
  const lang = useLessonLang();
  if (!ctx) return null;
  const lesson = lessonFor(ctx.levelId);
  if (!lesson) return null;
  return { ...lang, lesson, step: lesson.steps?.[ctx.stepId] || null, levelId: ctx.levelId };
}
