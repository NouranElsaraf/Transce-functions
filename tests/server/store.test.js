import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createStore, StoreError } from '../../server/store.mjs';
import { demoLesson, FULL_CHECKLIST, tempContent } from '../helpers.js';

let tmp;
let store;
beforeEach(() => {
  tmp = tempContent();
  store = createStore(tmp.dir);
});
afterEach(() => tmp.cleanup());

const toApproved = async () => {
  await store.importLesson(demoLesson(), { by: 'author' });
  await store.submit('integration-water-tank', 'author');
  return store.approve('integration-water-tank', { by: 'Dr. Mona', checklist: FULL_CHECKLIST, acknowledgeFlags: true });
};

describe('store = persistence/publishing boundary', () => {
  it('imports untrusted JSON as a draft, discarding any claimed review status', async () => {
    const forged = { ...demoLesson(), review: { status: 'published', approvedBy: 'Me', contentHash: 'x', history: [] } };
    const l = await store.importLesson(forged, { by: 'author' });
    expect(l.review.status).toBe('draft');
    expect(l.review.approvedBy).toBeUndefined();
    expect(existsSync(path.join(tmp.dir, 'published', 'integration-water-tank.json'))).toBe(false);
  });

  it('refuses duplicates unless replacing, and rejects unsafe ids (path traversal)', async () => {
    await store.importLesson(demoLesson());
    await expect(store.importLesson(demoLesson())).rejects.toMatchObject({ code: 'exists' });
    await expect(store.importLesson({ ...demoLesson(), id: '../../etc/passwd' })).rejects.toBeInstanceOf(StoreError);
    await expect(store.get('../secrets')).rejects.toMatchObject({ code: 'bad-id' });
  });

  it('has no public way to set a status directly', () => {
    expect(store.transition).toBeUndefined();
    expect(Object.isFrozen(store)).toBe(true);
  });

  it('publishes only approved lessons, as a frozen snapshot', async () => {
    await store.importLesson(demoLesson());
    await expect(store.publish('integration-water-tank', 'x')).rejects.toMatchObject({ code: 'not-approved', status: 409 });
    await store.submit('integration-water-tank', 'author');
    await expect(store.publish('integration-water-tank', 'x')).rejects.toMatchObject({ code: 'not-approved' });
    await store.approve('integration-water-tank', { by: 'Dr. Mona', checklist: FULL_CHECKLIST, acknowledgeFlags: true });
    const p = await store.publish('integration-water-tank', 'Dr. Mona');
    expect(p.review.status).toBe('published');
    expect(JSON.parse(readFileSync(path.join(tmp.dir, 'published', 'integration-water-tank.json'), 'utf8')).review.status).toBe('published');
  });

  it('editing after approval invalidates it; the published snapshot stays the approved version', async () => {
    await toApproved();
    await store.publish('integration-water-tank', 'Dr. Mona');
    const current = await store.get('integration-water-tank');
    const edited = await store.editLesson('integration-water-tank', { ...current, meta: { ...current.meta, estimatedMinutes: 25 } }, 'author');
    expect(edited.review.status).toBe('draft');
    await expect(store.publish('integration-water-tank', 'x')).rejects.toMatchObject({ code: 'not-approved' });
    expect((await store.getPublished('integration-water-tank')).meta.estimatedMinutes).toBe(15);
  });

  it('approval is bound to content even if a file is edited behind the store’s back', async () => {
    await toApproved();
    const file = path.join(tmp.dir, 'lessons', 'integration-water-tank.json');
    const raw = JSON.parse(readFileSync(file, 'utf8'));
    raw.assessments[0].numeric.tolerance.value = 0.5;
    writeFileSync(file, JSON.stringify(raw));
    await expect(store.publish('integration-water-tank', 'x')).rejects.toMatchObject({ code: 'stale-approval' });
  });

  it('attaching narration is a content edit: it invalidates approval and is validated', async () => {
    await toApproved();
    const l = await store.attachNarration('integration-water-tank', Buffer.from('RIFF....WAVEfmt '), 'audio/wav', { by: 'author', durationSec: 47.6 });
    expect(l.review.status).toBe('draft');
    expect(l.animation.narration).toMatchObject({ status: 'recorded', assets: [{ src: 'assets/integration-water-tank/narration.wav', durationSec: 47.6 }] });
    expect(existsSync(path.join(tmp.dir, 'assets', 'integration-water-tank', 'narration.wav'))).toBe(true);
    await expect(store.attachNarration('integration-water-tank', Buffer.from('x'), 'text/html')).rejects.toMatchObject({ code: 'bad-audio' });
  });

  it('pipeline writes only plain new drafts', async () => {
    const l = { ...demoLesson(), id: 'gen-1', review: { status: 'approved', history: [] } };
    await expect(store.saveLesson(l)).rejects.toMatchObject({ code: 'not-draft' });
    await expect(store.saveLesson({ ...l, review: { status: 'draft', approvedBy: 'x', history: [] } })).rejects.toMatchObject({ code: 'not-draft' });
  });
});
