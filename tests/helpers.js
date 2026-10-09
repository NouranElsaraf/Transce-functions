import { readFileSync } from 'node:fs';
import { mkdtempSync, rmSync, cpSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const DEMO = path.resolve(import.meta.dirname, '../content/imports/integration-water-tank.demo.json');

/** A fresh deep copy of the hand-authored demo lesson. */
export const demoLesson = () => JSON.parse(readFileSync(DEMO, 'utf8'));

export const FULL_CHECKLIST = { math: true, arabic: true, narration: true, sync: true, clarity: true };

/** Temporary content directory (cleaned up by the returned function). */
export function tempContent() {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'lesson-store-'));
  return { dir, cleanup: () => rmSync(dir, { recursive: true, force: true }), copy: (src) => cpSync(src, dir, { recursive: true }) };
}
