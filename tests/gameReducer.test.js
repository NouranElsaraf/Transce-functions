import { describe, expect, it } from 'vitest';
import { gameReducer, hydrate, initialState, isUnlocked, persistable } from '../src/core/gameReducer.js';

const run = (actions, state = initialState) => actions.reduce(gameReducer, state);

describe('gameReducer', () => {
  it('builds a combo on consecutive correct answers and resets on a slip', () => {
    const s = run([{ type: 'START_LEVEL', levelId: 'a' }, ...Array(3).fill({ type: 'ANSWER', correct: true })]);
    expect(s.combo).toBe(3);
    expect(s.xp).toBe(10 + 12 + 14);
    const s2 = gameReducer(s, { type: 'ANSWER', correct: false });
    expect(s2.combo).toBe(0);
    expect(s2.bestCombo).toBe(3);
    expect(s2.run.mistakes).toBe(1);
  });

  it('completes a level with stars from the run', () => {
    const s = run([
      { type: 'START_LEVEL', levelId: 'a' },
      { type: 'USE_HINT' },
      { type: 'COMPLETE_LEVEL', levelId: 'a' },
    ]);
    expect(s.levels.a).toMatchObject({ completed: true, bestStars: 2 });
    expect(s.run.finished).toBe(true);
    expect(s.stats.noHintLevels).toBe(0);
  });

  it('keeps the best star count across replays', () => {
    const s = run([
      { type: 'START_LEVEL', levelId: 'a' },
      { type: 'COMPLETE_LEVEL', levelId: 'a' },
      { type: 'START_LEVEL', levelId: 'a' },
      { type: 'USE_HINT' },
      { type: 'USE_HINT' },
      { type: 'COMPLETE_LEVEL', levelId: 'a' },
    ]);
    expect(s.levels.a.bestStars).toBe(3);
    expect(s.levels.a.lastStars).toBe(1);
  });

  it('teacher skip completes without XP', () => {
    const s = run([{ type: 'START_LEVEL', levelId: 'a' }, { type: 'COMPLETE_LEVEL', levelId: 'a', skipped: true, stars: 0 }]);
    expect(s.levels.a.completed).toBe(true);
    expect(s.xp).toBe(0);
  });

  it('unlocks levels sequentially, or all in teacher mode', () => {
    const ids = ['a', 'b', 'c'];
    expect(isUnlocked(initialState, ids, 0)).toBe(true);
    expect(isUnlocked(initialState, ids, 1)).toBe(false);
    const done = run([{ type: 'START_LEVEL', levelId: 'a' }, { type: 'COMPLETE_LEVEL', levelId: 'a' }]);
    expect(isUnlocked(done, ids, 1)).toBe(true);
    const teacher = gameReducer(initialState, { type: 'SET_TEACHER', key: 'enabled', value: true });
    expect(isUnlocked(teacher, ids, 2)).toBe(true);
  });

  it('turning teacher mode off clears its tools', () => {
    const s = run([
      { type: 'SET_TEACHER', key: 'enabled', value: true },
      { type: 'SET_TEACHER', key: 'paused', value: true },
      { type: 'SET_TEACHER', key: 'enabled', value: false },
    ]);
    expect(s.teacher).toEqual(initialState.teacher);
  });

  it('reset keeps settings but wipes progress', () => {
    const s = run([
      { type: 'SET_SETTING', key: 'sound', value: false },
      { type: 'ANSWER', correct: true },
      { type: 'RESET_PROGRESS' },
    ]);
    expect(s.xp).toBe(0);
    expect(s.settings.sound).toBe(false);
  });

  it('never persists teacher tools or the current run, and hydrates safely', () => {
    const s = run([{ type: 'START_LEVEL', levelId: 'a' }, { type: 'SET_TEACHER', key: 'enabled', value: true }]);
    const saved = persistable(s);
    expect(saved.teacher).toBeUndefined();
    expect(saved.run).toBeUndefined();
    expect(hydrate(saved).teacher.enabled).toBe(false);
    expect(hydrate({ version: -1, xp: 999 }).xp).toBe(0);
    expect(hydrate(null)).toEqual(initialState);
  });
});
