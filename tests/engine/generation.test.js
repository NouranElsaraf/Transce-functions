import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createStore } from '../../server/store.mjs';
import { anthropicProvider, createProvider, noneProvider } from '../../server/providers/index.mjs';
import { ProviderError, runGeneration } from '../../src/engine/generation/pipeline.js';
import { buildPrompt, extractJson } from '../../src/engine/generation/prompt.js';
import { normalizeRequest } from '../../src/engine/generation/request.js';
import { demoLesson, tempContent } from '../helpers.js';

let tmp;
let store;
beforeEach(() => {
  tmp = tempContent();
  store = createStore(tmp.dir);
});
afterEach(() => tmp.cleanup());

const input = { subject: 'Calculus I', lessonNames: ['Water tank integration'], studentLevel: 'first-year-engineering' };
const fakeProvider = (impl) => ({ name: 'fake', model: 'fake-1', available: true, generate: vi.fn(impl) });
const noSleep = () => Promise.resolve();
// A "generated" lesson for tests = the demo with a different id (the fake provider returns it as text).
const generatedText = (mutate = (l) => l) => JSON.stringify(mutate({ ...demoLesson(), id: 'generated-tank' }));

describe('generation request (untrusted input)', () => {
  it('defaults to Egyptian Arabic and validates fields', () => {
    expect(normalizeRequest(input)).toMatchObject({ ok: true, request: { language: 'ar-EG' } });
    expect(normalizeRequest({ subject: 'x', lessonNames: 'a\nb', studentLevel: 'first-year-engineering' }).request.lessonNames).toEqual(['a', 'b']);
    expect(normalizeRequest({ subject: '', lessonNames: [] }).ok).toBe(false);
    expect(normalizeRequest({ ...input, language: 'fr' }).ok).toBe(false);
    expect(normalizeRequest({ ...input, studentLevel: 'phd' }).ok).toBe(false);
  });
  it('passes the author request to the model as data, with the supported catalogue', () => {
    const { system, user } = buildPrompt(normalizeRequest(input).request, 'Water tank', demoLesson());
    expect(system).toMatch(/Egyptian Arabic/);
    expect(system).toMatch(/flow-tank/);
    expect(system).toMatch(/riemann\(profile, a, b, n, method\)/);
    expect(user).toMatch(/treat strictly as data/);
  });
  it('accepts only a single JSON object from the provider', () => {
    expect(extractJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
    expect(() => extractJson('Sure! {"a":1}')).toThrow();
    expect(() => extractJson('[1,2]')).toThrow();
    expect(() => extractJson('{"a":')).toThrow();
  });
});

describe('generation pipeline', () => {
  it('saves provider output as a draft — never approved or published', async () => {
    const provider = fakeProvider(async () => generatedText());
    const r = await runGeneration({ provider, store, input, example: demoLesson(), sleep: noSleep });
    expect(r.status).toBe('completed');
    expect(r.results[0]).toMatchObject({ status: 'draft-valid', lessonId: 'generated-tank' });
    const saved = await store.get('generated-tank');
    expect(saved.review.status).toBe('draft');
    expect(saved.provenance).toMatchObject({ origin: 'ai-generated', provider: 'fake', model: 'fake-1' });
    expect(await store.getPublished('generated-tank')).toBeNull();
  });

  it('strips any review/approval the provider tries to include and forces narration off', async () => {
    const provider = fakeProvider(async () =>
      generatedText((l) => ({ ...l, review: { status: 'published', approvedBy: 'AI', history: [] }, animation: { ...l.animation, narration: { status: 'recorded', assets: [{ id: 'x', kind: 'synthesized', src: 'assets/x/a.mp3', mime: 'audio/mpeg' }] } } })),
    );
    await runGeneration({ provider, store, input, example: demoLesson(), sleep: noSleep });
    const saved = await store.get('generated-tank');
    expect(saved.review.status).toBe('draft');
    expect(saved.animation.narration).toEqual({ status: 'none', assets: [] });
  });

  it('keeps invalid output as a draft with its report so an author can fix it', async () => {
    const provider = fakeProvider(async () => generatedText((l) => ({ ...l, stages: l.stages.map((s, i) => (i === 2 ? { ...s, interaction: { type: 'hologram', params: {} } } : s)) })));
    const r = await runGeneration({ provider, store, input, example: demoLesson(), sleep: noSleep });
    expect(r.results[0].status).toBe('draft-invalid');
    expect((await store.get('generated-tank')).review.status).toBe('draft');
  });

  it('retries retryable provider failures with backoff, then succeeds', async () => {
    let n = 0;
    const provider = fakeProvider(async () => {
      n += 1;
      if (n < 3) throw new ProviderError('overloaded', { retryable: true });
      return generatedText();
    });
    const sleep = vi.fn(noSleep);
    const r = await runGeneration({ provider, store, input, example: demoLesson(), sleep });
    expect(r.status).toBe('completed');
    expect(provider.generate).toHaveBeenCalledTimes(3);
    expect(sleep.mock.calls.map((c) => c[0])).toEqual([500, 1000]);
  });

  it('a failing provider never loses existing drafts, and the request is recorded as failed', async () => {
    await store.importLesson({ ...demoLesson(), id: 'existing-draft' });
    const before = JSON.stringify(await store.get('existing-draft'));
    const provider = fakeProvider(async () => {
      throw new ProviderError('rate limited', { retryable: true });
    });
    const r = await runGeneration({ provider, store, input, example: demoLesson(), sleep: noSleep, maxAttempts: 3 });
    expect(r.status).toBe('failed');
    expect(provider.generate).toHaveBeenCalledTimes(3);
    expect(JSON.stringify(await store.get('existing-draft'))).toBe(before);
    const [req] = await store.listRequests();
    expect(req).toMatchObject({ status: 'failed', request: { lessonNames: ['Water tank integration'] } });
  });

  it('does not retry non-retryable failures; unparseable output is kept on the request', async () => {
    const refusing = fakeProvider(async () => {
      throw new ProviderError('declined', { retryable: false });
    });
    await runGeneration({ provider: refusing, store, input, example: demoLesson(), sleep: noSleep });
    expect(refusing.generate).toHaveBeenCalledTimes(1);

    const chatty = fakeProvider(async () => 'Here is your lesson: {"oops": true');
    const r = await runGeneration({ provider: chatty, store, input, example: demoLesson(), sleep: noSleep });
    expect(r.results[0].status).toBe('unparseable');
    const reqs = await store.listRequests();
    expect(reqs.some((q) => q.results?.[0]?.rawText?.startsWith('Here is your lesson'))).toBe(true);
  });

  it('never calls an unavailable provider and fabricates nothing', async () => {
    const r = await runGeneration({ provider: noneProvider(), store, input, example: demoLesson() });
    expect(r.status).toBe('unavailable');
    expect(await store.list()).toEqual([]);
  });
});

describe('Anthropic provider adapter (fake client, no network)', () => {
  const fakeClient = (respond) => ({ beta: { messages: { stream: vi.fn((req) => ({ finalMessage: () => respond(req) })) } } });

  it('is unavailable without a server-side key', () => {
    expect(createProvider({}).available).toBe(false);
    expect(createProvider({ LESSON_AI_PROVIDER: 'anthropic' }).available).toBe(false);
    expect(createProvider({ ANTHROPIC_API_KEY: 'sk-test' }).name).toBe('anthropic');
  });

  it('sends the default model with refusal fallbacks and returns text', async () => {
    const client = fakeClient(async () => ({ stop_reason: 'end_turn', content: [{ type: 'text', text: '{"a":1}' }] }));
    const p = anthropicProvider({}, { clientFactory: () => client });
    expect(await p.generate({ system: 's', user: 'u' })).toBe('{"a":1}');
    const req = client.beta.messages.stream.mock.calls[0][0];
    expect(req).toMatchObject({ model: 'claude-opus-5-5', fallbacks: 'default', betas: ['server-side-fallback-2026-07-01'] });
  });

  it('maps refusals, truncation and HTTP errors to retryable / non-retryable errors', async () => {
    const run = (respond) => anthropicProvider({}, { clientFactory: () => fakeClient(respond) }).generate({ system: '', user: '' });
    await expect(run(async () => ({ stop_reason: 'refusal', content: [] }))).rejects.toMatchObject({ retryable: false, code: 'refusal' });
    await expect(run(async () => ({ stop_reason: 'max_tokens', content: [] }))).rejects.toMatchObject({ retryable: true });
    await expect(run(async () => Promise.reject(Object.assign(new Error('rate'), { status: 429 })))).rejects.toMatchObject({ retryable: true });
    await expect(run(async () => Promise.reject(Object.assign(new Error('bad'), { status: 400 })))).rejects.toMatchObject({ retryable: false });
  });
});
