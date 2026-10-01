/**
 * The game's single source of truth.
 *
 * A plain reducer (no React) so every rule — combos, stars, unlocking, resets —
 * is unit-testable. Persistent progress and transient session data live side by side;
 * `persistable()` strips what must not be saved (teacher tools, the current run).
 * @module gameReducer
 */
import { starsFor, xpForCorrect, xpForLevel } from './scoring.js';

export const STATE_VERSION = 1;

export const initialState = {
  version: STATE_VERSION,
  xp: 0,
  combo: 0,
  bestCombo: 0,
  stats: { correct: 0, wrong: 0, hints: 0, noHintLevels: 0 },
  /** levelId → { completed, bestStars, lastStars } */
  levels: {},
  /** achievementId → unlock timestamp */
  achievements: {},
  settings: { sound: true, theme: 'system', masry: false },
  /** Current level attempt; reset on START_LEVEL. */
  run: null,
  /** Teacher tools — never persisted. */
  teacher: { enabled: false, paused: false, drawing: false, reveal: false },
  /** Last XP gain, used by the UI to animate "+12 XP". */
  lastGain: null,
};

/** Merge saved progress into a fresh initial state (tolerates older/partial saves). */
export function hydrate(saved) {
  if (!saved || saved.version !== STATE_VERSION) return { ...initialState };
  return {
    ...initialState,
    ...saved,
    stats: { ...initialState.stats, ...saved.stats },
    settings: { ...initialState.settings, ...saved.settings },
    teacher: { ...initialState.teacher },
    run: null,
    lastGain: null,
  };
}

/** The subset of state written to storage. */
export function persistable(state) {
  const { teacher, run, lastGain, ...rest } = state;
  return rest;
}

/** Is level at `index` (in the ordered id list) playable? */
export function isUnlocked(state, levelIds, index) {
  if (state.teacher.enabled || index === 0) return true;
  return Boolean(state.levels[levelIds[index - 1]]?.completed);
}

let gainId = 0;

export function gameReducer(state, action) {
  switch (action.type) {
    case 'START_LEVEL':
      return { ...state, run: { levelId: action.levelId, step: 0, mistakes: 0, hints: 0 } };

    case 'ANSWER': {
      if (action.correct) {
        const combo = state.combo + 1;
        const gain = xpForCorrect(combo);
        return {
          ...state,
          combo,
          bestCombo: Math.max(state.bestCombo, combo),
          xp: state.xp + gain,
          stats: { ...state.stats, correct: state.stats.correct + 1 },
          lastGain: { id: ++gainId, amount: gain, combo },
        };
      }
      return {
        ...state,
        combo: 0,
        stats: { ...state.stats, wrong: state.stats.wrong + 1 },
        run: state.run ? { ...state.run, mistakes: state.run.mistakes + 1 } : state.run,
        lastGain: { id: ++gainId, amount: 0, combo: 0 },
      };
    }

    case 'USE_HINT':
      return {
        ...state,
        stats: { ...state.stats, hints: state.stats.hints + 1 },
        run: state.run ? { ...state.run, hints: state.run.hints + 1 } : state.run,
      };

    case 'ADVANCE_STEP':
      return state.run ? { ...state, run: { ...state.run, step: state.run.step + 1 } } : state;

    case 'GOTO_STEP':
      return state.run ? { ...state, run: { ...state.run, step: action.step } } : state;

    case 'COMPLETE_LEVEL': {
      const run = state.run || { mistakes: 0, hints: 0 };
      const stars = action.stars ?? starsFor(run);
      const prev = state.levels[action.levelId] || {};
      const gain = action.skipped ? 0 : xpForLevel(stars);
      return {
        ...state,
        xp: state.xp + gain,
        levels: {
          ...state.levels,
          [action.levelId]: {
            completed: true,
            lastStars: stars,
            bestStars: Math.max(prev.bestStars || 0, stars),
          },
        },
        stats: {
          ...state.stats,
          noHintLevels: state.stats.noHintLevels + (run.hints === 0 && !action.skipped ? 1 : 0),
        },
        run: state.run ? { ...state.run, finished: true, stars } : null,
        lastGain: action.skipped ? state.lastGain : { id: ++gainId, amount: gain, combo: state.combo },
      };
    }

    case 'UNLOCK_ACHIEVEMENT':
      if (state.achievements[action.id]) return state;
      return { ...state, achievements: { ...state.achievements, [action.id]: action.at ?? Date.now() } };

    case 'SET_SETTING':
      return { ...state, settings: { ...state.settings, [action.key]: action.value } };

    case 'SET_TEACHER': {
      const teacher = { ...state.teacher, [action.key]: action.value };
      if (action.key === 'enabled' && !action.value) {
        Object.assign(teacher, { paused: false, drawing: false, reveal: false });
      }
      return { ...state, teacher };
    }

    case 'RESET_PROGRESS':
      return { ...initialState, settings: state.settings, teacher: state.teacher };

    default:
      return state;
  }
}
