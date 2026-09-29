/**
 * Ordered list of level metadata (plain data, no components).
 *
 * Split from the component registry so core logic (achievements, unlocking)
 * can know about levels without importing any React code.
 * @module metaRegistry
 */
import speedDetective from './SpeedDetective/meta.js';
import growingKingdom from './GrowingKingdom/meta.js';
import graphSculptor from './GraphSculptor/meta.js';

/** @type {Array<import('./types.js').LevelMeta>} */
export const LEVEL_METAS = [speedDetective, growingKingdom, graphSculptor];

export const LEVEL_IDS = LEVEL_METAS.map((m) => m.id);
