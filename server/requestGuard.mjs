/**
 * Request guard for the local studio API: blocks cross-site requests and DNS rebinding.
 *
 * The studio has no login, so it relies on the browser to tell it where a request
 * came from:
 *   - Host must be a loopback name (localhost / 127.0.0.1 / [::1]) on an allowed port.
 *     This stops DNS rebinding, where evil.example resolves to 127.0.0.1.
 *   - Every non-GET/HEAD request that carries an Origin must come from an allowed
 *     loopback origin. Browsers send Origin on every cross-origin POST/PUT, so a
 *     missing Origin means a non-browser client (curl, scripts) on this machine,
 *     which is allowed.
 *   - JSON bodies must be `application/json`. That type is not CORS-simple, so a
 *     foreign page cannot send it without a preflight, which this server never grants.
 * @module server/requestGuard
 */

const LOOPBACK_HOSTS = ['localhost', '127.0.0.1', '[::1]'];
const SAFE_METHODS = new Set(['GET', 'HEAD']);

/** Vite's dev server port; the studio UI is served from it and proxies /api. */
export const VITE_DEV_PORT = 5173;

/**
 * @param {number[]} ports  ports the API may be reached on (its own + the Vite dev port)
 * @returns {{hosts: Set<string>, origins: Set<string>}}
 */
export function studioAllowlist(ports) {
  const hosts = new Set();
  for (const port of ports) for (const name of LOOPBACK_HOSTS) hosts.add(`${name}:${port}`);
  return { hosts, origins: new Set([...hosts].map((h) => `http://${h}`)) };
}

/**
 * @param {{method: string, headers: Record<string, string|undefined>}} req
 * @param {{hosts: Set<string>, origins: Set<string>}} allow
 * @returns {null | {status: number, code: string, message: string}} null when allowed
 */
export function checkRequest(req, allow) {
  const host = (req.headers.host || '').toLowerCase();
  if (!allow.hosts.has(host)) return { status: 403, code: 'forbidden-host', message: 'Host is not an allowed local studio address.' };
  if (SAFE_METHODS.has(req.method)) return null;
  const origin = req.headers.origin;
  if (origin !== undefined && !allow.origins.has(origin.toLowerCase())) {
    return { status: 403, code: 'forbidden-origin', message: 'Cross-origin writes are not allowed.' };
  }
  return null;
}

/** @param {string|undefined} contentType */
export function isJsonContentType(contentType) {
  return (contentType || '').split(';')[0].trim().toLowerCase() === 'application/json';
}
