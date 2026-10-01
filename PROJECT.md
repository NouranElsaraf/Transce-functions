# PROJECT.md — Transcendental Quest

## Vision

A first-year engineering student opens a browser tab "just to try one level" and closes it an hour later
understanding *why* slopes are speeds, why doubling explodes, why waves repeat and why a hanging chain
isn't a parabola — without having memorised a single formula.

The experience borrows:

- **Duolingo** — tiny steps, streaks, XP, instant feedback, always one tap away from progress.
- **Portal** — each room is a puzzle with a mechanic you discover by poking at it.
- **Brilliant.org** — interaction first, explanation second, and never more than 2–3 sentences.

### Design principles

1. **Never start with a formula.** Every symbol is introduced *after* the player already felt the idea.
2. **Predict → Try → Notice.** Each step asks the player to commit to a guess, then shows the truth.
3. **Short beats.** A step takes 30–90 seconds. There's always a visible "next" to keep momentum.
4. **Reward curiosity, not speed.** Stars reward first-try insight; hints are free but cost a star.
5. **Grown-up look.** Glass cards, calm colours, smooth motion. Not a kids' game.

## Roadmap

| Milestone | Scope | Status |
|---|---|---|
| M0 — Scaffold | Vite + React, CI, docs generator, project docs | ✅ |
| M1 — Core engine | Game state, persistence, XP/combo/stars, achievements, sound, confetti, plotting, teacher mode, level map | ✅ |
| M2 — Calculus foundations | L1 Speed Detective, L2 Growing Kingdom, L3 Graph Sculptor | ✅ |
| M3 — Waves | L4 Light Beam, L5 The Swing | ✅ |
| M4 — Hyperbolic & finale | L6 Hyperbolic World, L7 Escape Room | ✅ |
| M5 — Polish | Accessibility pass, docs, tests | ✅ |
| M6 — Lesson companion | Egyptian-Arabic explanations, discovery prompts, real-life bridges, reality/engineer buttons, misconceptions | ✅ |
| M7 — Next | See *Future Features* | ⏳ |

## Architecture

```
index.html
src/
  main.jsx               entry point
  App.jsx                screen router (home ↔ level ↔ finale) + global overlays
  core/                  framework-free logic (pure JS, unit-tested)
    gameReducer.js       single source of truth for progress/XP/combo/settings
    GameContext.jsx      React provider, persistence, side-effects (sound, confetti, achievements)
    achievements.js      achievement definitions + unlock rules
    scoring.js           XP, combo and star formulas
    mathUtils.js         numeric helpers (derivative, catenary, easing…)
    sound.js             WebAudio synthesiser (no audio files)
    confetti.js          canvas confetti burst
    storage.js           safe localStorage wrapper
  hooks/                 reusable React hooks (animation loop that respects Teacher pause, theme colours…)
  components/            UI building blocks (cards, buttons, sliders, plot, toasts, teacher tools…)
  levels/
    registry.js          ordered list of levels
    <LevelName>/
      meta.js            title, steps, goals (plain JS → also feeds the docs generator)
      index.jsx          the level, composed from step components
      *.jsx              one file per step / scene
  screens/               Home (level map), LevelScreen (step runner), Finale
  styles/                design tokens, global styles, component styles
scripts/generate-docs.mjs  builds docs/MODULES.md and docs/LEVELS.md from the source
tests/                    vitest unit tests for core logic
```

### Data flow

```
 Step component ──answer()──▶ LevelScreen ──dispatch──▶ gameReducer ──▶ state
        ▲                                                   │
        └──────────── props (hintsUsed, teacher…) ◀─────────┘
                                     GameContext effects: persist, sound, confetti, achievements
```

- **Levels never touch storage or XP directly.** A step reports `answer(correct)`, `useHint()` and
  `complete()` through a small `StepAPI`. The runner converts that into reducer actions.
- **All animation goes through `useAnimationFrame`**, which reads the global Teacher-mode pause flag.
  One switch freezes every moving thing in the app.
- **Plots are canvas-based** (`<Plot>`), theme-aware (reads CSS variables) and high-DPI.

## Tech Stack

| Concern | Choice | Why |
|---|---|---|
| UI | React 19 | Component model keeps each level/step isolated |
| Build | Vite | Instant dev server, static output with relative paths |
| Graphics | Canvas 2D + inline SVG | No heavy chart libraries; full control over animation |
| Audio | Web Audio API | Synthesised blips, zero asset files |
| State | `useReducer` + Context | Predictable, testable, no extra dependency |
| Persistence | `localStorage` | No login, no backend |
| Tests | Vitest + jsdom | Same config as Vite |
| CI | GitHub Actions | Docs freshness check, tests, build |

## Future Features

- **Custom challenge builder** for teachers (save a target graph, share as a URL hash).
- **Class code** export/import of progress as a JSON file (still no backend).
- **Chapter 2: Inverse functions** — logarithms as "undoing" the Growing Kingdom.
- **Chapter 3: Integration** — area under the Speed Detective's velocity graph = distance.
- **Arabic / French localisation** with RTL layout support.
- **Accessibility**: screen-reader narration of graphs (every canvas drag already has a slider alternative).
- **Offline PWA** install so it runs in a lab with no internet.
