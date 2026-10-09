/**
 * `npm run studio` — starts the local studio API (server/index.mjs) and the
 * Vite dev server (which proxies /api to it). Ctrl+C stops both.
 */
import { spawn } from 'node:child_process';

const procs = [
  spawn(process.execPath, ['server/index.mjs'], { stdio: 'inherit', env: process.env }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js'], { stdio: 'inherit', env: process.env }),
];
const stop = () => procs.forEach((p) => p.kill('SIGTERM'));
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
procs.forEach((p) => p.on('exit', (code) => { if (code) { stop(); process.exitCode = code; } }));
console.log('Studio: open http://localhost:5173/#/studio');
