/**
 * Local authoring server for the Learning Experience Engine.
 *
 *   node server/index.mjs            (or: npm run studio:server)
 *
 * Binds to 127.0.0.1 only. It is a single-author local tool with no login, and the
 * `by` field is a self-reported name, not an identity: do not expose it to the
 * internet. Vite proxies /api to it during `npm run studio`.
 *
 * Every request passes ./requestGuard.mjs first: loopback Host on the API or Vite
 * port (403), an allowed Origin on writes when one is sent (403), and
 * `application/json` for JSON bodies (415).
 *
 * Routes
 *   GET  /api/health                         provider + voice status
 *   GET  /api/lessons                        summaries
 *   GET  /api/lessons/:id                    lesson + validation report
 *   POST /api/lessons/import   {lesson, replace?, by?}
 *   PUT  /api/lessons/:id      {content, by}  edit (invalidates approval)
 *   POST /api/lessons/:id/submit   {by}
 *   POST /api/lessons/:id/approve  {by, checklist, acknowledgeFlags, notes}
 *   POST /api/lessons/:id/reject   {by, notes}
 *   POST /api/lessons/:id/publish  {by}
 *   POST /api/lessons/:id/narration   raw audio body (Content-Type audio/*), ?durationSec=&by=
 *   POST /api/generate   {subject, lessonNames, studentLevel, language}
 *   GET  /api/requests                       generation request log
 * @module server/index
 */
import http from 'node:http';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createStore, StoreError } from './store.mjs';
import { checkRequest, isJsonContentType, studioAllowlist, VITE_DEV_PORT } from './requestGuard.mjs';
import { createProvider, createVoiceProvider } from './providers/index.mjs';
import { validateLesson } from '../src/engine/schema/lessonSchema.js';
import { runGeneration } from '../src/engine/generation/pipeline.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const JSON_LIMIT = 1024 * 1024;
const DEFAULT_PORT = 8787;
const AUDIO_LIMIT = 15 * 1024 * 1024;

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) {
        reject(new StoreError('too-large', 'Request body too large.', 413));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function readJsonBody(req) {
  if (!isJsonContentType(req.headers['content-type'])) {
    throw new StoreError('unsupported-media-type', 'Send JSON bodies as Content-Type: application/json.', 415);
  }
  const buf = await readBody(req, JSON_LIMIT);
  if (!buf.length) return {};
  try {
    return JSON.parse(buf.toString('utf8'));
  } catch {
    throw new StoreError('bad-json', 'Body is not valid JSON.');
  }
}

const send = (res, status, body) => {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
  res.end(JSON.stringify(body));
};

/**
 * @param {object} deps
 * @param {number[]} [deps.ports]  ports the API is reachable on; defaults to the API port and Vite's dev port
 */
export function createApp({ store, provider, voice, example, ports = [DEFAULT_PORT, VITE_DEV_PORT] }) {
  const allow = studioAllowlist(ports);
  return async function handle(req, res) {
    const blocked = checkRequest(req, allow);
    if (blocked) {
      req.resume(); // drain without reading
      return send(res, blocked.status, { error: blocked.code, message: blocked.message });
    }
    const url = new URL(req.url, 'http://localhost');
    const parts = url.pathname.split('/').filter(Boolean);
    try {
      if (parts[0] !== 'api') return send(res, 404, { error: 'not-found' });
      const [, resource, id, action] = parts;

      if (resource === 'health' && req.method === 'GET') {
        return send(res, 200, {
          provider: { name: provider.name, model: provider.model, available: provider.available, reason: provider.unavailableReason ?? null },
          voice,
        });
      }

      if (resource === 'requests' && req.method === 'GET') return send(res, 200, await store.listRequests());

      if (resource === 'generate' && req.method === 'POST') {
        const body = await readJsonBody(req);
        const result = await runGeneration({ provider, store, input: body, example });
        const status = result.status === 'rejected-request' ? 400 : result.status === 'unavailable' ? 503 : result.status === 'failed' ? 502 : 200;
        return send(res, status, result);
      }

      if (resource !== 'lessons') return send(res, 404, { error: 'not-found' });

      if (!id && req.method === 'GET') return send(res, 200, await store.summaries());

      if (id === 'import' && req.method === 'POST') {
        const body = await readJsonBody(req);
        const lesson = await store.importLesson(body.lesson, { by: body.by, replace: Boolean(body.replace) });
        return send(res, 201, { lesson, report: validateLesson(lesson) });
      }

      if (id && !action && req.method === 'GET') {
        const lesson = await store.get(id);
        return send(res, 200, { lesson, report: validateLesson(lesson), published: await store.getPublished(id) });
      }

      if (id && !action && req.method === 'PUT') {
        const body = await readJsonBody(req);
        const lesson = await store.editLesson(id, body.content, body.by);
        return send(res, 200, { lesson, report: validateLesson(lesson) });
      }

      if (id && req.method === 'POST') {
        if (action === 'narration') {
          const mime = (req.headers['content-type'] || '').split(';')[0].trim();
          const buf = await readBody(req, AUDIO_LIMIT);
          const durationSec = Number(url.searchParams.get('durationSec'));
          const lesson = await store.attachNarration(id, buf, mime, { by: url.searchParams.get('by') || 'author', durationSec: Number.isFinite(durationSec) && durationSec > 0 ? durationSec : undefined });
          return send(res, 200, { lesson, report: validateLesson(lesson) });
        }
        const body = await readJsonBody(req);
        let lesson;
        if (action === 'submit') lesson = await store.submit(id, body.by);
        else if (action === 'approve') lesson = await store.approve(id, { by: body.by, checklist: body.checklist, acknowledgeFlags: body.acknowledgeFlags === true, notes: body.notes });
        else if (action === 'reject') lesson = await store.reject(id, { by: body.by, notes: body.notes });
        else if (action === 'publish') lesson = await store.publish(id, body.by);
        else return send(res, 404, { error: 'not-found' });
        return send(res, 200, { lesson, report: validateLesson(lesson) });
      }

      return send(res, 405, { error: 'method-not-allowed' });
    } catch (e) {
      if (e instanceof StoreError) return send(res, e.status, { error: e.code, message: e.message });
      console.error(e);
      return send(res, 500, { error: 'internal', message: 'Unexpected server error.' });
    }
  };
}

async function main() {
  const contentRoot = process.env.LESSON_CONTENT_DIR || path.join(ROOT, 'content');
  const store = createStore(contentRoot);
  const provider = createProvider(process.env);
  const voice = createVoiceProvider(process.env);
  const example = JSON.parse(await readFile(path.join(ROOT, 'content', 'imports', 'integration-water-tank.demo.json'), 'utf8'));
  const port = Number(process.env.STUDIO_PORT || DEFAULT_PORT);
  http.createServer(createApp({ store, provider, voice, example, ports: [port, VITE_DEV_PORT] })).listen(port, '127.0.0.1', () => {
    console.log(`Studio API on http://127.0.0.1:${port}  (content: ${contentRoot})`);
    console.log(`Generation provider: ${provider.name}${provider.available ? ` (${provider.model})` : ' — unavailable: ' + provider.unavailableReason}`);
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
