# CLAUDE.md

Guidance for AI coding agents (Claude Code, Codex via `AGENTS.md`) working in this repo.
Product vision and architecture live in [PROJECT.md](PROJECT.md); this file is only the rules and gotchas.

## Before you say "done"

Run exactly what CI runs (`.github/workflows/ci.yml`):

```bash
npm ci
npm run docs:check   # fails if docs/ is stale → run `npm run docs` and commit the result
npm test
npm run build
```

## Gotchas

- **`docs/MODULES.md` and `docs/LEVELS.md` are generated.** Never edit them by hand. Changing any
  `meta.js`, `lesson.js` or a file's top `@module` JSDoc block means you must re-run `npm run docs`.
- **New source files need a top-of-file `/** ... @module name */` block** so they appear in `docs/MODULES.md`.
- **Adding a level touches four places:** `src/levels/<Name>/` (`meta.js`, `lesson.js`, `index.jsx`),
  `src/levels/registry.js`, `src/levels/metaRegistry.js` and `src/lesson/registry.js`.
- **Every step needs bilingual lesson content.** `tests/lesson.test.jsx` checks each step for an English
  `ask`, an Arabic `ask`, two Egyptian-Arabic `masry` lines, plus 3 reality uses, 3 engineering uses and
  3 misconceptions per level.
- **No formula without a real-life bridge.** If a step renders `.insight-formula`, it must also render a
  `.bridge` (why → everyday example → engineering example). This is checked by a test.
- **Levels never touch XP or storage.** Steps only call the `StepAPI` (`answer`, `hint`, `complete`);
  progress goes through `src/core/gameReducer.js`.
- **Level/step animation goes through `useAnimationFrame`** so Teacher Mode's global pause freezes it.
  Don't call `requestAnimationFrame` directly in levels (confetti is the only exception).
- **Every canvas drag needs a slider alternative** (keyboard and touch access).

## Teaching style (don't break it)

- Interaction first, then explanation. Explanations are at most 2–3 sentences.
- Wrong-answer feedback explains *why* the wrong answer is tempting.
- The Masry "before" text sets up the problem without giving the answer away.

## Conventions

- Plain JS/JSX (no TypeScript), React 19, no new runtime dependencies without a good reason.
- No backend, no network calls. Everything stays in the browser (`localStorage` via `src/core/storage.js`).
- Add user-facing changes to `CHANGELOG.md`.
