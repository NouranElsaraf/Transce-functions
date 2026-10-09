/**
 * Import a lesson JSON file into the local store through the same boundary the
 * studio uses (validation + review workflow). Imported lessons start as drafts.
 *
 *   node scripts/import-lesson.mjs <file.json> [--replace] [--submit] [--by "Name"]
 *
 * --submit moves a valid draft to "in review". Approval and publishing are
 * deliberately NOT available here: they need a named human reviewer in the studio.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStore } from '../server/store.mjs';
import { validateLesson } from '../src/engine/schema/lessonSchema.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
const byIndex = args.indexOf('--by');
const by = byIndex >= 0 ? args[byIndex + 1] : 'author';
if (!file) {
  console.error('usage: node scripts/import-lesson.mjs <file.json> [--replace] [--submit] [--by Name]');
  process.exit(2);
}
const store = createStore(process.env.LESSON_CONTENT_DIR || path.join(ROOT, 'content'));
const raw = JSON.parse(await readFile(file, 'utf8'));
let lesson = await store.importLesson(raw, { by, replace: args.includes('--replace') });
const report = validateLesson(lesson);
console.log(`imported ${lesson.id} → ${lesson.review.status}; ${report.errors.length} error(s), ${report.warnings.length} warning(s)`);
for (const e of report.errors) console.log(`  ✗ ${e.path}: ${e.message}`);
for (const w of report.warnings) console.log(`  ! ${w.path}: ${w.message}`);
if (args.includes('--submit')) {
  lesson = await store.submit(lesson.id, by);
  console.log(`submitted → ${lesson.review.status} (awaiting human approval in the studio)`);
}
