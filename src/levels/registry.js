/**
 * Ordered registry of playable levels: `{ meta, steps }` objects.
 * Add a level by creating its folder and appending it here and in metaRegistry.js.
 * @module registry
 */

export const LEVELS = [];

export const levelById = (id) => LEVELS.find((l) => l.meta.id === id);
