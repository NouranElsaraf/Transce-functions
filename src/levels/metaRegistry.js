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
import lightBeam from './LightBeam/meta.js';
import theSwing from './TheSwing/meta.js';
import hyperbolicWorld from './HyperbolicWorld/meta.js';
import escapeRoom from './EscapeRoom/meta.js';

/** @type {Array<import('./types.js').LevelMeta>} */
export const LEVEL_METAS = [speedDetective, growingKingdom, graphSculptor, lightBeam, theSwing, hyperbolicWorld, escapeRoom];

export const LEVEL_IDS = LEVEL_METAS.map((m) => m.id);
