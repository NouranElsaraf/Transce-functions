/**
 * Level 7 — Escape Room: five locks that each need one earlier insight,
 * then a keypad door whose code turns out to be e.
 * @module EscapeRoom
 */
import meta from './meta.js';
import LockTangent from './LockTangent.jsx';
import LockJar from './LockJar.jsx';
import LockShape from './LockShape.jsx';
import LockWave from './LockWave.jsx';
import LockChain from './LockChain.jsx';
import LockDoor from './LockDoor.jsx';

export default { meta, steps: [LockTangent, LockJar, LockShape, LockWave, LockChain, LockDoor] };
