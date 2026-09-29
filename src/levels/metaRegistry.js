/**
 * Ordered list of level metadata (plain data, no components).
 *
 * Split from the component registry so core logic (achievements, unlocking)
 * can know about levels without importing any React code.
 * @module metaRegistry
 */

/** @type {Array<import('./types.js').LevelMeta>} */
export const LEVEL_METAS = [];

export const LEVEL_IDS = LEVEL_METAS.map((m) => m.id);
