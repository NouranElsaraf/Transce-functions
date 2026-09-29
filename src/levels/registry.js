/**
 * Ordered registry of playable levels: `{ meta, steps }` objects.
 * Add a level by creating its folder and appending it here and in metaRegistry.js.
 * @module registry
 */
import SpeedDetective from './SpeedDetective/index.jsx';
import GrowingKingdom from './GrowingKingdom/index.jsx';
import GraphSculptor from './GraphSculptor/index.jsx';
import LightBeam from './LightBeam/index.jsx';
import TheSwing from './TheSwing/index.jsx';
import HyperbolicWorld from './HyperbolicWorld/index.jsx';
import EscapeRoom from './EscapeRoom/index.jsx';

export const LEVELS = [SpeedDetective, GrowingKingdom, GraphSculptor, LightBeam, TheSwing, HyperbolicWorld, EscapeRoom];

export const levelById = (id) => LEVELS.find((l) => l.meta.id === id);
