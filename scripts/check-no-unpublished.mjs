/**
 * CI guard: a normal production build (dist/) must not contain any lesson that
 * is not published. Looks for each unpublished lesson's Arabic title in the
 * built JavaScript. Run after `npm run build`.
 */
import { readFile, readdir } from 'node:fs/promises';

const lessons = [];
for (const f of (await readdir('content/lessons').catch(() => [])).filter((x) => x.endsWith('.json'))) {
  const l = JSON.parse(await readFile(`content/lessons/${f}`, 'utf8'));
  const published = await readFile(`content/published/${f}`, 'utf8').then(() => true, () => false);
  if (!published && l.meta?.title?.ar) lessons.push(l);
}
const bundle = (await Promise.all((await readdir('dist/assets')).filter((f) => f.endsWith('.js')).map((f) => readFile(`dist/assets/${f}`, 'utf8')))).join('\n');
const leaked = lessons.filter((l) => bundle.includes(l.meta.title.ar));
if (leaked.length) {
  console.error(`✗ unpublished lesson(s) bundled into dist/: ${leaked.map((l) => l.id).join(', ')}`);
  process.exit(1);
}
console.log(`✓ no unpublished lessons in dist/ (checked ${lessons.length})`);
