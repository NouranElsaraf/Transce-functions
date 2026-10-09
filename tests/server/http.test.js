import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import http from 'node:http';
import { createApp } from '../../server/index.mjs';
import { createStore } from '../../server/store.mjs';
import { noneProvider } from '../../server/providers/index.mjs';
import { demoLesson, FULL_CHECKLIST, tempContent } from '../helpers.js';

let tmp;
let server;
let base;

beforeAll(async () => {
  tmp = tempContent();
  const app = createApp({ store: createStore(tmp.dir), provider: noneProvider(), voice: { name: 'upload-only', available: false }, example: demoLesson() });
  server = http.createServer(app);
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}/api`;
});
afterAll(async () => {
  await new Promise((r) => server.close(r));
  tmp.cleanup();
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
