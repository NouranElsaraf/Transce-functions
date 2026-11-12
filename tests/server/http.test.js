import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import http from 'node:http';
import { createServer as createViteServer } from 'vite';
import viteConfig from '../../vite.config.js';
import { createApp } from '../../server/index.mjs';
import { createStore } from '../../server/store.mjs';
import { noneProvider } from '../../server/providers/index.mjs';
import { demoLesson, FULL_CHECKLIST, tempContent } from '../helpers.js';

let tmp;
let server;
let port;
let base;
let app;

beforeAll(async () => {
  tmp = tempContent();
  // The app needs the real (ephemeral) port for its Host/Origin allowlist, so listen first.
  server = http.createServer((q, s) => app(q, s));
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  port = server.address().port;
  app = createApp({ store: createStore(tmp.dir), provider: noneProvider(), voice: { name: 'upload-only', available: false }, example: demoLesson(), ports: [port] });
  base = `http://127.0.0.1:${port}/api`;
});
afterAll(async () => {
  await new Promise((r) => server.close(r));
  tmp.cleanup();
});

/** Raw request so tests can forge Host/Origin (fetch forbids setting Host). */
const raw = (targetPort, method, p, { headers = {}, body } = {}) =>
  new Promise((resolve, reject) => {
    const r = http.request({ host: '127.0.0.1', port: targetPort, method, path: `/api${p}`, headers }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null }));
    });
    r.on('error', reject);
    r.end(body);
  });

const call = async (method, p, body) => {
  const res = await fetch(base + p, { method, headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  return { status: res.status, body: await res.json() };
};

describe('studio HTTP API', () => {
  it('reports that live generation is unavailable without credentials, and records the request', async () => {
    const h = await call('GET', '/health');
    expect(h.body.provider).toMatchObject({ name: 'none', available: false });
    const g = await call('POST', '/generate', { subject: 'Calculus I', lessonNames: ['Integration'], studentLevel: 'first-year-engineering' });
    expect(g.status).toBe(503);
    expect(g.body.status).toBe('unavailable');
    const reqs = await call('GET', '/requests');
    expect(reqs.body[0]).toMatchObject({ status: 'unavailable', request: { subject: 'Calculus I', lessonNames: ['Integration'], language: 'ar-EG' } });
    expect((await call('GET', '/lessons')).body).toEqual([]); // nothing fabricated
  });

  it('rejects malformed generation requests', async () => {
    const g = await call('POST', '/generate', { subject: '<script>x</script>', lessonNames: [] });
    expect(g.status).toBe(400);
  });

  it('runs import → submit → approve → publish, enforcing every gate server-side', async () => {
    const imp = await call('POST', '/lessons/import', { lesson: { ...demoLesson(), review: { status: 'published', history: [] } }, by: 'author' });
    expect(imp.status).toBe(201);
    expect(imp.body.lesson.review.status).toBe('draft');
    expect(imp.body.report.ok).toBe(true);

    expect((await call('POST', '/lessons/integration-water-tank/publish', { by: 'x' })).status).toBe(409);
    expect((await call('POST', '/lessons/integration-water-tank/approve', { by: 'Dr. Mona', checklist: FULL_CHECKLIST, acknowledgeFlags: true })).status).toBe(409);
    expect((await call('POST', '/lessons/integration-water-tank/submit', { by: 'author' })).status).toBe(200);
    expect((await call('POST', '/lessons/integration-water-tank/approve', { by: 'Dr. Mona', checklist: { math: true } })).body.error).toBe('checklist');
    expect((await call('POST', '/lessons/integration-water-tank/approve', { by: 'Dr. Mona', checklist: FULL_CHECKLIST })).body.error).toBe('flags');
    const ok = await call('POST', '/lessons/integration-water-tank/approve', { by: 'Dr. Mona', checklist: FULL_CHECKLIST, acknowledgeFlags: true });
    expect(ok.body.lesson.review.status).toBe('approved');
    const pub = await call('POST', '/lessons/integration-water-tank/publish', { by: 'Dr. Mona' });
    expect(pub.body.lesson.review.status).toBe('published');
    const got = await call('GET', '/lessons/integration-water-tank');
    expect(got.body.published.review.status).toBe('published');
  });

  it('PUT edits ignore any review field and invalidate approval', async () => {
    const { body } = await call('GET', '/lessons/integration-water-tank');
    const edited = { ...body.lesson, meta: { ...body.lesson.meta, estimatedMinutes: 16 }, review: { status: 'published', approvedBy: 'Hacker', history: [] } };
    const put = await call('PUT', '/lessons/integration-water-tank', { content: edited, by: 'author' });
    expect(put.body.lesson.review.status).toBe('draft');
    expect(put.body.lesson.review.approvedBy).toBeUndefined();
  });

  it('bad JSON and oversized bodies are refused', async () => {
    const res = await fetch(`${base}/lessons/import`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{nope' });
    expect(res.status).toBe(400);
    const big = await fetch(`${base}/lessons/import`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: 'x'.repeat(1024 * 1024 + 10) }).catch(() => ({ status: 413 }));
    expect([413]).toContain(big.status);
  });
});

describe('studio HTTP API: cross-site and DNS-rebinding protection', () => {
  // An *available* provider, so a request that slips through would really call it.
  const generate = vi.fn(async () => { throw new Error('model must not be called'); });
  const paidProvider = { name: 'spy', model: 'spy-model', available: true, generate };
  let sTmp;
  let sServer;
  let sPort;
  let sApp;
  let vite;
  let vitePort;

  const probe = (lesson) => [
    ['POST', '/generate', JSON.stringify({ subject: 'Calculus I', lessonNames: ['Integration'], studentLevel: 'first-year-engineering' })],
    ['POST', '/lessons/import', JSON.stringify({ lesson, replace: true, by: 'Dr. Mona' })],
    ['POST', '/lessons/integration-water-tank/submit', JSON.stringify({ by: 'Dr. Mona' })],
    ['POST', '/lessons/integration-water-tank/approve', JSON.stringify({ by: 'Dr. Mona', checklist: FULL_CHECKLIST, acknowledgeFlags: true })],
    ['POST', '/lessons/integration-water-tank/publish', JSON.stringify({ by: 'Dr. Mona' })],
    ['PUT', '/lessons/integration-water-tank', JSON.stringify({ content: lesson, by: 'Dr. Mona' })],
  ];

  beforeAll(async () => {
    sTmp = tempContent();
    sServer = http.createServer((q, s) => sApp(q, s));
    await new Promise((r) => sServer.listen(0, '127.0.0.1', r));
    sPort = sServer.address().port;

    // Run Vite with the repo's real /api proxy options, only re-targeted at this test server.
    const real = viteConfig.server.proxy['/api'];
    const options = typeof real === 'string' ? { target: real } : real;
    vite = await createViteServer({ configFile: false, logLevel: 'silent', server: { host: '127.0.0.1', port: 0, proxy: { '/api': { ...options, target: `http://127.0.0.1:${sPort}` } } } });
    await vite.listen();
    vitePort = vite.httpServer.address().port;

    sApp = createApp({ store: createStore(sTmp.dir), provider: paidProvider, voice: { name: 'upload-only', available: false }, example: demoLesson(), ports: [sPort, vitePort] });
  });
  afterAll(async () => {
    await vite.close();
    await new Promise((r) => sServer.close(r));
    sTmp.cleanup();
  });

  it('the Vite proxy keeps the browser Host header (no changeOrigin), so the API can check it', () => {
    const real = viteConfig.server.proxy['/api'];
    expect(typeof real === 'string' || !real.changeOrigin).toBe(true);
  });

  it('text/plain to /generate is 415 and the provider is never called', async () => {
    const r = await raw(sPort, 'POST', '/generate', { headers: { host: `127.0.0.1:${sPort}`, 'content-type': 'text/plain' }, body: probe()[0][2] });
    expect(r.status).toBe(415);
    expect(r.body.error).toBe('unsupported-media-type');
    expect(generate).not.toHaveBeenCalled();
  });

  it('JSON routes refuse a missing Content-Type and form encodings with 415', async () => {
    for (const ct of [undefined, 'application/x-www-form-urlencoded', 'multipart/form-data; boundary=x']) {
      const headers = { host: `127.0.0.1:${sPort}`, ...(ct ? { 'content-type': ct } : {}) };
      expect((await raw(sPort, 'POST', '/lessons/import', { headers, body: '{}' })).status).toBe(415);
    }
  });

  it('a foreign Origin is 403 on every write, before the body is read', async () => {
    for (const [method, p, body] of probe(demoLesson())) {
      const r = await raw(sPort, method, p, { headers: { host: `127.0.0.1:${sPort}`, origin: 'https://evil.example', 'content-type': 'application/json' }, body });
      expect(r.status, `${method} ${p}`).toBe(403);
      expect(r.body.error).toBe('forbidden-origin');
    }
    expect(generate).not.toHaveBeenCalled();
  });

  it('a foreign Host is 403 on reads and writes (DNS rebinding)', async () => {
    const headers = { host: `evil.example:${sPort}` };
    expect((await raw(sPort, 'GET', '/lessons', { headers })).status).toBe(403);
    expect((await raw(sPort, 'GET', '/health', { headers })).body.error).toBe('forbidden-host');
    expect((await raw(sPort, 'POST', '/generate', { headers: { ...headers, 'content-type': 'application/json' }, body: probe()[0][2] })).status).toBe(403);
  });

  it('the narration route still requires audio/* (and the Origin check)', async () => {
    const host = `127.0.0.1:${sPort}`;
    expect((await raw(sPort, 'POST', '/lessons/x/narration', { headers: { host, origin: 'https://evil.example', 'content-type': 'audio/webm' }, body: 'a' })).status).toBe(403);
    const bad = await raw(sPort, 'POST', '/lessons/x/narration', { headers: { host, origin: `http://localhost:${vitePort}`, 'content-type': 'text/plain' }, body: 'a' });
    expect(bad.status).toBe(415);
  });

  it('replays the original probe through the Vite proxy: every step is blocked', async () => {
    const lesson = { ...demoLesson(), meta: { ...demoLesson().meta, title: 'Injected' } };
    for (const [method, p, body] of probe(lesson)) {
      // What the reviewer's page sent: a CORS-simple text/plain POST from a foreign origin.
      const simple = await fetch(`http://127.0.0.1:${vitePort}/api${p}`, { method, headers: { origin: 'https://evil.example', 'content-type': 'text/plain' }, body });
      expect([403, 415], `${method} ${p}`).toContain(simple.status);
      const json = await fetch(`http://127.0.0.1:${vitePort}/api${p}`, { method, headers: { origin: 'https://evil.example', 'content-type': 'application/json' }, body });
      expect(json.status, `${method} ${p}`).toBe(403);
    }
    expect(generate).not.toHaveBeenCalled();
    const list = await raw(sPort, 'GET', '/lessons', { headers: { host: `127.0.0.1:${sPort}` } });
    expect(list.body).toEqual([]); // nothing was imported
  });

  it('the studio itself still works through the proxy (allowed dev origin, application/json)', async () => {
    const origin = `http://localhost:${vitePort}`;
    const viaProxy = (method, p, body) => raw(vitePort, method, p, { headers: { host: `localhost:${vitePort}`, origin, 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const imp = await viaProxy('POST', '/lessons/import', { lesson: demoLesson(), by: 'author' });
    expect(imp.status).toBe(201);
    expect((await viaProxy('POST', '/lessons/integration-water-tank/submit', { by: 'author' })).status).toBe(200);
    expect((await raw(vitePort, 'GET', '/lessons', { headers: { host: `localhost:${vitePort}` } })).body).toHaveLength(1);
  });

  it('non-browser clients (no Origin header) on loopback are still allowed', async () => {
    const r = await fetch(`http://127.0.0.1:${sPort}/api/lessons/integration-water-tank/reject`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ by: 'Dr. Mona', notes: 'needs work' }) });
    expect(r.status).toBe(200);
  });
});
