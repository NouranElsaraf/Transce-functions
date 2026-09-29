/**
 * Ordered registry of playable levels: `{ meta, steps }` objects.
 * Add a level by creating its folder and appending it here and in metaRegistry.js.
 * @module registry
 */
import SpeedDetective from './SpeedDetective/index.jsx';
import GrowingKingdom from './GrowingKingdom/index.jsx';
import GraphSculptor from './GraphSculptor/index.jsx';

export const LEVELS = [SpeedDetective, GrowingKingdom, GraphSculptor];

export const levelById = (id) => LEVELS.find((l) => l.meta.id === id);
