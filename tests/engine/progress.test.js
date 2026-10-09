import { describe, expect, it } from 'vitest';
import { labReducer, masteredAll } from '../../src/engine/progress/labProgress.js';
import { gameReducer, hydrate, initialState, persistable, STATE_VERSION } from '../../src/core/gameReducer.js';

const objectives = ['o-units', 'o-area'];

describe('lesson progress', () => {
  it('records attempts and credits objectives only for credited correct answers', () => {
    let s = labReducer({}, { type: 'LAB_ANSWER', lessonId: 'L', assessmentId: 'a1', objectiveIds: ['o-area'], correct: false });
    expect(s.L.objectives).toEqual({});
    s = labReducer(s, { type: 'LAB_ANSWER', lessonId: 'L', assessmentId: 'a1', objectiveIds: ['o-area'], correct: true, credited: false });
    expect(s.L.attempts.a1).toMatchObject({ tries: 2, correct: true, credited: false });
    expect(s.L.objectives['o-area']).toBeUndefined();
    s = labReducer(s, { type: 'LAB_ANSWER', lessonId: 'L', assessmentId: 'a2', objectiveIds: ['o-area'], correct: true });
    expect(s.L.objectives['o-area']).toBe(true);
  });

  it('completes only when every objective is mastered — not on reaching the last scene', () => {
    let s = labReducer({}, { type: 'LAB_STAGE', lessonId: 'L', stage: 8 });
    s = labReducer(s, { type: 'LAB_COMPLETE', lessonId: 'L', objectiveIds: objectives });
    expect(s.L.completed).toBe(false);
    s = labReducer(s, { type: 'LAB_ANSWER', lessonId: 'L', assessmentId: 'a', objectiveIds: objectives, correct: true });
    expect(masteredAll(s.L, objectives)).toBe(true);
    s = labReducer(s, { type: 'LAB_COMPLETE', lessonId: 'L', objectiveIds: objectives, at: 1 });
    expect(s.L).toMatchObject({ completed: true, completedAt: 1, furthest: 8 });
  });

  it('remembers the furthest stage and the seed of a new-values challenge', () => {
    let s = labReducer({}, { type: 'LAB_STAGE', lessonId: 'L', stage: 5 });
    s = labReducer(s, { type: 'LAB_STAGE', lessonId: 'L', stage: 2 });
    expect(s.L).toMatchObject({ stage: 2, furthest: 5 });
    s = labReducer(s, { type: 'LAB_NEW_SEED', lessonId: 'L', assessmentId: 'ch', seed: 77 });
    expect(s.L.attempts.ch.seed).toBe(77);
  });
});

describe('saved-progress compatibility (existing games)', () => {
  // A save written by v1.1.0, before engine lessons existed.
  const oldSave = {
    version: 1,
    xp: 640,
    combo: 2,
    bestCombo: 9,
    stats: { correct: 40, wrong: 6, hints: 3, noHintLevels: 2 },
    levels: { 'speed-detective': { completed: true, lastStars: 3, bestStars: 3 }, 'growing-kingdom': { completed: true, lastStars: 2, bestStars: 2 } },
    achievements: { 'first-insight': 1, 'speed-detective': 2 },
    settings: { sound: false, theme: 'dark', masry: true },
  };

  it('keeps the same storage version, so old saves are not wiped', () => {
    expect(STATE_VERSION).toBe(1);
  });

  it('loads an old save unchanged and adds an empty lessons map', () => {
    const s = hydrate(oldSave);
    expect(s.xp).toBe(640);
    expect(s.levels).toEqual(oldSave.levels);
    expect(s.achievements).toEqual(oldSave.achievements);
    expect(s.settings).toEqual(oldSave.settings);
    expect(s.lessons).toEqual({});
  });

  it('ignores a corrupted lessons field instead of crashing', () => {
    expect(hydrate({ ...oldSave, lessons: 'garbage' }).lessons).toEqual({});
    expect(hydrate({ ...oldSave, lessons: [1, 2] }).lessons).toEqual({});
  });

  it('lesson progress persists alongside game progress and game actions still work', () => {
    let s = hydrate(oldSave);
    s = gameReducer(s, { type: 'LAB_ANSWER', lessonId: 'integration-water-tank', assessmentId: 'a', objectiveIds: ['o'], correct: true });
    s = gameReducer(s, { type: 'START_LEVEL', levelId: 'light-beam' });
    s = gameReducer(s, { type: 'ANSWER', correct: true });
    const saved = persistable(s);
    expect(saved.lessons['integration-water-tank'].objectives.o).toBe(true);
    expect(saved.levels).toEqual(oldSave.levels);
    expect(saved.xp).toBeGreaterThan(640);
    const reloaded = hydrate(JSON.parse(JSON.stringify(saved)));
    expect(reloaded.lessons).toEqual(saved.lessons);
  });

  it('reset clears lesson progress too, keeping settings', () => {
    const s = gameReducer(hydrate({ ...oldSave, lessons: { x: { completed: true } } }), { type: 'RESET_PROGRESS' });
    expect(s.lessons).toEqual({});
    expect(s.settings).toEqual(oldSave.settings);
    expect(initialState.lessons).toEqual({});
  });
});
