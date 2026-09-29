/**
 * Shared JSDoc type definitions for levels. No runtime code.
 *
 * A level is a folder in `src/levels/` with:
 *   - `meta.js`   — a {@link LevelMeta} object (also read by the docs generator)
 *   - `index.jsx` — exports `{ meta, steps }` where `steps[i]` renders `meta.steps[i]`
 *
 * Every step component receives a {@link StepAPI} as its `api` prop.
 * @module types
 */

/**
 * @typedef {Object} StepMeta
 * @property {string} id
 * @property {string} title  Short name shown in the step header.
 * @property {string} goal   One-line learning goal (docs + teacher mode).
 */

/**
 * @typedef {Object} LevelMeta
 * @property {string} id        Stable id used for saves and achievements.
 * @property {number} order     1-based position on the map.
 * @property {string} title
 * @property {string} topic     Syllabus topic covered.
 * @property {string} tagline   One-sentence hook shown on the map.
 * @property {string} bigIdea   The single insight the player should walk away with.
 * @property {string} icon      Icon name (see components/Icon.jsx).
 * @property {string} accent    CSS colour used for the level's theme.
 * @property {number} minutes   Rough play time.
 * @property {StepMeta[]} steps
 */

/**
 * @typedef {Object} StepAPI
 * @property {(correct: boolean) => boolean} answer  Record an answer; returns `correct`.
 * @property {() => void} hint       Register that a hint was revealed.
 * @property {() => void} complete   Finish this step and move to the next.
 * @property {boolean} reveal        Teacher mode: explanations should be shown immediately.
 * @property {boolean} paused        Teacher mode: animations are paused.
 * @property {string} accent         The level's accent colour.
 */

export {};
