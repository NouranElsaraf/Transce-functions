/**
 * Safe wrapper around localStorage.
 *
 * Private windows, blocked cookies or quota errors must never crash the game,
 * so every access is guarded and falls back to in-memory defaults.
 * @module storage
 */

const PREFIX = 'transcendental-quest:';

/** Read and JSON-parse a value, returning `fallback` on any failure. */
export function load(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/** JSON-serialise and store a value. Silently ignores failures. */
export function save(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage unavailable — progress simply won't persist */
  }
}

/** Remove a stored value. */
export function remove(key) {
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}
