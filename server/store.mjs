/**
 * File-backed lesson store — the persistence/publishing boundary.
 *
 * Every write goes through the review workflow (src/engine/review/workflow.js):
 *  - content updates can never set review status (the incoming `review` is discarded);
 *  - edits to approved/published content invalidate the approval;
 *  - only `publish()` writes to content/published/, and only for an approved
 *    lesson whose content still matches its approval hash.
 *
 * Layout under `root`:
 *   lessons/<id>.json      working copies (draft / in review / approved …)
 *   published/<id>.json    frozen snapshots served to students
 *   assets/<id>/…          uploaded narration recordings
 *   requests/<id>.json     generation requests (never lost on provider failure)
 * @module server/store
 */
import { mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { validateLesson } from '../src/engine/schema/lessonSchema.js';
import { approve, draftReview, editContent, publish, reject, ReviewError, submitForReview } from '../src/engine/review/workflow.js';

const ID = /^[a-z0-9][a-z0-9-]{1,59}$/;
const AUDIO = { 'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/ogg': 'ogg', 'audio/wav': 'wav', 'audio/x-wav': 'wav', 'audio/webm': 'webm' };

export class StoreError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function safeId(id) {
  if (typeof id !== 'string' || !ID.test(id)) throw new StoreError('bad-id', 'Invalid lesson id.');
  return id;
}

async function writeJsonAtomic(file, value) {
  await mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmp, `${JSON.stringify(value, null, 2)}\n`);
  await rename(tmp, file);
}

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (e) {
    if (e.code === 'ENOENT') return null;
    throw e;
  }
}

export function createStore(root) {
  const dir = (...p) => path.join(root, ...p);
  const lessonFile = (id) => dir('lessons', `${safeId(id)}.json`);

  const wrap = (fn) => {
    try {
      return fn();
    } catch (e) {
      if (e instanceof ReviewError) throw new StoreError(e.code, e.message, 409);
      throw e;
    }
  };

  const store = {
    root,

    async list() {
      let files = [];
      try {
        files = (await readdir(dir('lessons'))).filter((f) => f.endsWith('.json'));
      } catch (e) {
        if (e.code !== 'ENOENT') throw e;
      }
      const lessons = [];
      for (const f of files.sort()) {
        const l = await readJson(dir('lessons', f));
        if (l) lessons.push(l);
      }
      return lessons;
    },

    async summaries() {
      const published = new Set((await readdir(dir('published')).catch(() => [])).map((f) => f.replace(/\.json$/, '')));
      return (await store.list()).map((l) => {
        const report = validateLesson(l);
        return {
          id: l.id,
          title: l.meta?.title?.ar ?? l.id,
          origin: l.provenance?.origin ?? 'unknown',
          status: l.review?.status ?? 'draft',
          valid: report.ok,
          errors: report.errors.length,
          warnings: report.warnings.length,
          live: published.has(l.id),
        };
      });
    },

    async get(id) {
      const l = await readJson(lessonFile(id));
      if (!l) throw new StoreError('not-found', `No lesson "${id}".`, 404);
      return l;
    },

    async getPublished(id) {
      return readJson(dir('published', `${safeId(id)}.json`));
    },

    /** Internal write used by the generation pipeline (always a draft). */
    async saveLesson(lesson) {
      safeId(lesson.id);
      if (lesson.review?.status !== 'draft' || Object.keys(lesson.review).some((k) => !['status', 'history'].includes(k))) {
        throw new StoreError('not-draft', 'New lessons can only be saved as plain drafts.');
      }
      if (await readJson(lessonFile(lesson.id))) throw new StoreError('exists', `Lesson "${lesson.id}" already exists.`, 409);
      await writeJsonAtomic(lessonFile(lesson.id), lesson);
      return lesson;
    },

    /** Import untrusted JSON as a new draft (or as an edit with `replace`). */
    async importLesson(raw, { by = 'author', replace = false } = {}) {
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new StoreError('bad-json', 'Import must be a JSON object.');
      safeId(raw.id);
      const existing = await readJson(lessonFile(raw.id));
      if (existing && !replace) throw new StoreError('exists', `Lesson "${raw.id}" already exists.`, 409);
      if (existing) return store.editLesson(raw.id, raw, by);
      const { review: _ignored, ...content } = raw;
      const lesson = { ...content, review: draftReview([], `imported by ${by}`) };
      await writeJsonAtomic(lessonFile(lesson.id), lesson);
      return lesson;
    },

    async editLesson(id, content, by) {
      const current = await store.get(id);
      const next = wrap(() => editContent(current, { ...content, id }, by));
      if (next !== current) await writeJsonAtomic(lessonFile(id), next);
      return next;
    },


    async publish(id, by) {
      const current = await store.get(id);
      const next = wrap(() => publish(current, by));
      // Snapshot first, then the working copy, so a crash can't leave a
      // "published" working copy without its snapshot.
      await writeJsonAtomic(dir('published', `${safeId(id)}.json`), next);
      await writeJsonAtomic(lessonFile(id), next);
      return next;
    },

    async unpublish(id) {
      await rm(dir('published', `${safeId(id)}.json`), { force: true });
    },

    async attachNarration(id, buffer, mime, { by, durationSec } = {}) {
      const ext = AUDIO[mime];
      if (!ext) throw new StoreError('bad-audio', `Unsupported audio type "${mime}".`, 415);
      if (!buffer?.length || buffer.length > 15 * 1024 * 1024) throw new StoreError('bad-audio', 'Recording must be 1 byte – 15 MB.', 413);
      const current = await store.get(id);
      if (!current.animation) throw new StoreError('no-animation', 'This lesson has no animation to narrate.');
      const rel = `assets/${safeId(id)}/narration.${ext}`;
      await mkdir(dir('assets', id), { recursive: true });
      await writeFile(dir(rel), buffer);
      const asset = { id: 'narration-main', kind: 'recorded', src: rel, mime, provider: 'upload', note: `Uploaded by ${by || 'author'}` };
      if (Number.isFinite(durationSec)) asset.durationSec = Math.round(durationSec * 10) / 10;
      const content = { ...current, animation: { ...current.animation, narration: { status: 'recorded', assets: [asset] } } };
      return store.editLesson(id, content, by);
    },

    // ---- generation requests ----
    async saveRequest(record) {
      const id = `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
      const full = { id, ...record };
      await writeJsonAtomic(dir('requests', `${id}.json`), full);
      return full;
    },
    async updateRequest(id, patch) {
      const file = dir('requests', `${id}.json`);
      const current = (await readJson(file)) ?? { id };
      const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
      await writeJsonAtomic(file, next);
      return next;
    },
    async listRequests() {
      const files = (await readdir(dir('requests')).catch(() => [])).filter((f) => f.endsWith('.json'));
      return Promise.all(files.sort().reverse().map((f) => readJson(dir('requests', f))));
    },
  };

  // Workflow verbs bound to the boundary. `transition` stays private so the
  // only way to change a review status is through these named steps.
  const transition = async (id, fn) => {
    const current = await store.get(id);
    const next = wrap(() => fn(current));
    await writeJsonAtomic(lessonFile(id), next);
    return next;
  };
  store.submit = (id, by) => transition(id, (l) => submitForReview(l, by));
  store.approve = (id, opts) => transition(id, (l) => approve(l, opts));
  store.reject = (id, opts) => transition(id, (l) => reject(l, opts));
  return Object.freeze(store);
}

