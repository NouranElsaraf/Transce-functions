/**
 * Progress for engine lessons, stored inside the existing game save under
 * `lessons` (same storage key and STATE_VERSION as the original game, so old
 * saves load unchanged and simply gain an empty `lessons` map).
 *
 * A lesson is complete only when every learning objective has been
 * demonstrated by at least one *credited* assessment — not when the last scene
 * is reached. An answer is credited only when it shows the student's own
 * reasoning: a choice right on the first pick, or a numeric answer right before
 * its worked explanation was shown (see the assessment components).
 *
 *   lessons[lessonId] = {
 *     stage, furthest,                       // stage indices
 *     attempts: { [assessmentId]: { tries, correct, credited, last, seed } },
 *     objectives: { [objectiveId]: true },
 *     completed, completedAt, contentHash
 *   }
 * @module engine/progress/labProgress
 */

const emptyEntry = () => ({ stage: 0, furthest: 0, attempts: {}, objectives: {}, completed: false });

export const LAB_ACTIONS = ['LAB_STAGE', 'LAB_ANSWER', 'LAB_NEW_SEED', 'LAB_COMPLETE', 'LAB_RESET'];

export function masteredAll(entry, objectiveIds) {
  return objectiveIds.length > 0 && objectiveIds.every((id) => entry?.objectives?.[id] === true);
}

/** Pure reducer for the `lessons` slice. */
export function labReducer(lessons = {}, action) {
  const id = action.lessonId;
  if (typeof id !== 'string') return lessons;
  const entry = { ...emptyEntry(), ...lessons[id] };
  switch (action.type) {
    case 'LAB_STAGE': {
      const stage = Math.max(0, action.stage | 0);
      return { ...lessons, [id]: { ...entry, stage, furthest: Math.max(entry.furthest, stage), contentHash: action.contentHash ?? entry.contentHash } };
    }
    case 'LAB_ANSWER': {
      const prev = entry.attempts[action.assessmentId] ?? { tries: 0, correct: false, credited: false };
      const credited = Boolean(action.correct) && action.credited !== false;
      const attempts = {
        ...entry.attempts,
        [action.assessmentId]: {
          tries: prev.tries + 1,
          correct: prev.correct || Boolean(action.correct),
          credited: Boolean(prev.credited) || credited,
          last: action.value ?? null,
          seed: action.seed ?? prev.seed,
        },
      };
      const objectives = { ...entry.objectives };
      if (credited) for (const o of action.objectiveIds ?? []) objectives[o] = true;
      return { ...lessons, [id]: { ...entry, attempts, objectives } };
    }
    case 'LAB_NEW_SEED': {
      const prev = entry.attempts[action.assessmentId] ?? { tries: 0, correct: false };
      return { ...lessons, [id]: { ...entry, attempts: { ...entry.attempts, [action.assessmentId]: { ...prev, seed: action.seed } } } };
    }
    case 'LAB_COMPLETE':
      if (entry.completed || !masteredAll(entry, action.objectiveIds ?? [])) return lessons;
      return { ...lessons, [id]: { ...entry, completed: true, completedAt: action.at ?? Date.now() } };
    case 'LAB_RESET': {
      const { [id]: _removed, ...rest } = lessons;
      return rest;
    }
    default:
      return lessons;
  }
}
