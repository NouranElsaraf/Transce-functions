/**
 * Lesson companion registry: levelId → lesson data (Egyptian-Arabic explanations,
 * real-life bridges, reality/engineering uses, misconceptions). Plain data only.
 * @module lesson/registry
 */
import speedDetective from '../levels/SpeedDetective/lesson.js';
import growingKingdom from '../levels/GrowingKingdom/lesson.js';
import graphSculptor from '../levels/GraphSculptor/lesson.js';
import lightBeam from '../levels/LightBeam/lesson.js';
import theSwing from '../levels/TheSwing/lesson.js';
import hyperbolicWorld from '../levels/HyperbolicWorld/lesson.js';
import escapeRoom from '../levels/EscapeRoom/lesson.js';

export const LESSONS = {
  'speed-detective': speedDetective,
  'growing-kingdom': growingKingdom,
  'graph-sculptor': graphSculptor,
  'light-beam': lightBeam,
  'the-swing': theSwing,
  'hyperbolic-world': hyperbolicWorld,
  'escape-room': escapeRoom,
};

export const lessonFor = (levelId) => LESSONS[levelId] || null;
