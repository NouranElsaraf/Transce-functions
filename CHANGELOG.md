# Changelog

## Unreleased — Learning Experience Engine (feature/learning-engine, pending review)

### Added
- Versioned lesson schema (v1) with a strict validator, named computations for every answer, and an interaction catalogue + renderer registry.
- Review workflow enforced at the store (writes) and the student catalogue (reads): draft → in review → approved (named human, checklist, acknowledged warnings) → published snapshot; content edits and narration uploads invalidate approval.
- Local studio (`npm run studio`, `#/studio`): generate (replaceable provider; Anthropic adapter needs a server-side key), import, validate, preview, review, approve, publish, upload narration.
- Living Lab renderer and the integration lesson “الخزان بيتملى بكام؟” (hand-authored demo content, currently **in review**, not published).
- Programmatic 48 s explainer: one timeline for animation, Arabic captions and narration, with play/pause/replay/mute/speed/seek.
- Engine-lesson progress in the existing save (`lessons`), same storage key and version.

### Not done / pending
- Live AI generation: implemented, not run (no credentials in this environment).
- Narration audio: upload pipeline done; no Egyptian-Arabic recording exists yet.

## 1.1.0 — Lesson companion

### Added
- **🇪🇬 اشرحها بالمصري** toggle: Egyptian-Arabic explanations for all 33 steps, written like an older sibling explaining it. Each step has a no-spoiler "before" part and a "why it works" part for after you solve it.
- Discovery strip (Observe → Predict → Interact → Reveal the math) and an "Ask yourself" question on every step.
- Real-life bridge (why, everyday example, engineering example) shown before every formula, enforced by tests.
- **🌍 فين بنشوف ده في الحقيقة؟** and **👷 المهندس بيستخدم ده فين؟** buttons in every lesson.
- 3 common misconceptions per level on the completion screen.
- The level guide (docs/LEVELS.md) now includes the questions, applications and misconceptions.

No game, level, animation or mechanic was changed.

## 1.0.0 — Chapter 1 complete

### Added
- **M0 Scaffold:** Vite + React 19 project, GitHub Actions CI (docs freshness, tests, build), and an automatic docs generator.
- **M1 Core engine:** a pure game reducer (XP, combo, stars, unlocking), local persistence, 15 achievements, 7 ranks, Web Audio sound effects, confetti, a canvas `Plot`/`Stage`, the `StepLayout` teaching loop, Teacher Mode (pause, ink, reveal, skip, reset) and the level map.
- **M2 Calculus foundations:** Speed Detective, Growing Kingdom and Graph Sculptor.
- **M3 Waves:** Light Beam and The Swing.
- **M4 Hyperbolic & finale:** Hyperbolic World and the Escape Room.
- **M5 Polish:** slider alternatives for every canvas drag (keyboard and precise touch input), render tests that mount every step, a browser sweep of all 33 steps on desktop and mobile, the README with screenshots, and this changelog.
