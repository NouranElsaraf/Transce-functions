/**
 * Student-facing catalogue. Bundles content/published/*.json at build time,
 * then re-checks every lesson on load: schema-valid, status "published", a
 * recorded human approval, and content matching the approval hash. Anything
 * else is dropped (and reported in `rejected`) — a file copied into the folder
 * by hand cannot reach students.
 * @module engine/catalog/published
 */
import { publishableReason } from '../review/workflow.js';

const files = import.meta.glob('../../../content/published/*.json', { eager: true, import: 'default' });
const audio = import.meta.glob('../../../content/assets/**/*.{mp3,m4a,ogg,wav,webm}', { eager: true, query: '?url', import: 'default' });

/** Pure: filter candidate lessons through the publishing gate. */
export function filterPublishable(candidates) {
  const lessons = [];
  const rejected = [];
  for (const lesson of candidates) {
    const reason = publishableReason(lesson);
    if (reason) rejected.push({ id: lesson?.id ?? '(unknown)', reason });
    else lessons.push(lesson);
  }
  lessons.sort((a, b) => String(a.id).localeCompare(String(b.id)));
  return { lessons, rejected };
}

let cache = null;
export function loadPublishedLessons() {
  cache ??= filterPublishable(Object.values(files));
  return cache;
}

/** Resolve a lesson-relative asset path ("assets/<id>/x.mp3") to a bundled URL. */
export function assetUrl(src) {
  const key = Object.keys(audio).find((k) => k.endsWith(`/content/${src}`));
  return key ? audio[key] : null;
}
