# Learning Experience Engine

The engine turns **validated lesson data** into interactive lessons, alongside the seven original games (which are unchanged). Lessons are data, never code. They are generated or imported, then validated, previewed, reviewed by a human, approved and published, and only then rendered to students.

```
author request ──► provider (optional) ──► parse ──► sanitise ──► validate ──► DRAFT
import JSON  ─────────────────────────────────────────────────────┘
DRAFT ──submit──► IN REVIEW ──approve (named human + checklist + flags)──► APPROVED ──publish──► PUBLISHED snapshot
  ▲                    │                                                       │
  └──── any content edit (incl. narration upload) invalidates approval ◄───────┘
```

| Layer | Where | Notes |
|---|---|---|
| Schema + validation | `src/engine/schema/lessonSchema.js` | Strict v1 schema; unknown fields, markup, unsupported interactions, uncomputable answers are errors |
| Maths | `src/engine/math/` | Accumulation, rectangle sums, tank with explicit overflow; **named computations** produce every answer |
| Interactions | `src/engine/interactions/catalog.js` → `src/lab/registry.jsx` | Catalogue (what each type teaches, params) + renderer per type |
| Generation | `src/engine/generation/` + `server/providers/` | Request validation, prompt, retries, draft-only saving; replaceable provider |
| Review / publishing | `src/engine/review/workflow.js` + `server/store.mjs` | Enforced at the store (writes) and the student catalogue (reads) |
| Narration | `src/engine/narration/` | One timeline: `sceneAt`, `captionAt`, `Playback` (single active playback) |
| Rendering | `src/lab/` | Living Lab player, apparatus, assessments, notebook |
| Progress | `src/engine/progress/labProgress.js` | Stored in the existing save under `lessons` |
| Authoring UI | `src/studio/Studio.jsx` (`#/studio`) | Talks to the local server |

## Running it locally

```bash
npm install
npm run studio          # studio API on 127.0.0.1:8787 + Vite on :5173
# open http://localhost:5173/#/studio
```

- **Import** a lesson: paste JSON or pick a file in the studio, or run
  `npm run lessons:import -- content/imports/integration-water-tank.demo.json --submit`.
  `--submit` moves it to *in review*. The CLI cannot approve or publish.
- **Preview**: select the lesson, then "معاينة زي الطالب". Previews never write student progress.
- **Review**: enter a reviewer name, tick the 5 checklist items, acknowledge warnings, then approve.
- **Publish**: writes `content/published/<id>.json`. Students see it on the map ("المعمل الحي") at `#/lab/<id>` after the next build or dev reload.

### Security model (local, single user)

The studio is a **local, single-user tool with no login and no authentication**. Keep it on your own machine.

- **`by` is not authenticated.** The author and reviewer names in the history (`by`, `approvedBy`) are whatever the person at the keyboard typed. They record who *says* they did it; they do not prove it. "Named approval" means a name is required, not verified.
- **Network:** the API binds to `127.0.0.1` only.
- **Host allowlist (DNS rebinding):** every request needs a `Host` of `localhost`, `127.0.0.1` or `[::1]` on the API port (`STUDIO_PORT`, default 8787) or the Vite dev port (5173). Anything else gets **403**.
- **Origin allowlist (CSRF):** every non-GET request that carries an `Origin` header must come from `http://localhost`, `http://127.0.0.1` or `http://[::1]` on one of those ports, or it gets **403**. A request with **no** `Origin` is allowed: browsers always send `Origin` on cross-origin POST/PUT, so a missing one means a non-browser client on this machine (curl, a script). Anything that can already run a process locally is out of scope.
- **JSON only:** JSON routes require `Content-Type: application/json`, or they return **415**. This blocks the `text/plain` and form posts a foreign page can send without a CORS preflight, and the server never answers preflights. The narration upload keeps its own rule: `audio/*` types only (415 otherwise).
- **Vite proxy:** `npm run studio` serves the UI on `localhost:5173` (strict port) and proxies `/api` without `changeOrigin`, so the browser's real `Host` and `Origin` reach the API and get checked.

What this does **not** cover: other users or malware on the same machine, a browser extension with host permissions, or running the server on a shared or public interface. Don't do that last one.

The checks live in `server/requestGuard.mjs` and are tested in `tests/server/requestGuard.test.js` and `tests/server/http.test.js`, which replays the original cross-site probe directly and through a real Vite proxy.

## Providers

### Lesson generation (AI)

| Env var (server only) | Default | Purpose |
|---|---|---|
| `LESSON_AI_PROVIDER` | `anthropic` if `ANTHROPIC_API_KEY` is set, else `none` | Which adapter to use |
| `ANTHROPIC_API_KEY` | — | Server-side key. It never reaches the browser |
| `LESSON_AI_MODEL` | `claude-opus-5-5` | Model id |
| `LESSON_AI_BASE_URL` | `https://api.anthropic.com` | API base URL |

- **No credentials:** generation reports *unavailable* (HTTP 503), logs the request in `content/requests/`, and creates nothing. Demo content must come in through **Import** and is labelled `provenance.origin: "demo"`.
- **Using a different vendor:** implement `{ name, model, available, generate({system, user}) → Promise<string> }` in `server/providers/` and add it to `PROVIDERS`.
- **Output handling:** the provider returns text. The pipeline accepts it only if it is exactly one JSON object; it never evaluates it. It then forces the following fields:
  - `provenance.origin = "ai-generated"`, with the provider and model recorded;
  - `review = draft`;
  - narration off.
- **Failures:** retryable failures (429, 5xx, network, truncation) are retried with backoff. Refusals and 4xx errors are not retried. Output that parses but fails validation is still saved as a draft, together with its report. Output that doesn't parse is kept on the request record. Existing drafts are never touched.

### Narration (voice)

No paid text-to-speech is enabled. Narration comes from an **uploaded human recording**: in the studio, choose "ارفع تسجيل صوتي". The recording becomes the explainer's master clock. Uploading counts as a content edit, so the lesson needs review again.

`LESSON_VOICE_PROVIDER` is reserved for a future synthetic-voice adapter, to be added only after cost approval. The studio offers browser speech **as an author preview only**. It is clearly labelled and is not treated as Egyptian-Arabic narration.

## Lesson schema v1 (summary)

```jsonc
{
  "schemaVersion": 1,
  "id": "integration-water-tank",
  "meta": { "title": {"ar": "…"}, "subject": "…", "topic": "…", "studentLevel": "first-year-engineering",
            "language": "ar-EG", "estimatedMinutes": 15, "tagline": {"ar": "…"} },
  "provenance": { "origin": "ai-generated|imported|demo|hand-authored", "provider?": "…", "model?": "…", "createdAt": "ISO", "note": "…" },
  "objectives":   [{ "id": "o-area", "skill": "accumulation", "text": {"ar": "…"} }],
  "prerequisites":[{ "id": "p-rate", "text": {"ar": "…"}, "levelRef?": "speed-detective" }],
  "sources":      [{ "id": "s-…", "title": "…", "publisher": "…", "url": "https://…", "accessed": "YYYY-MM-DD", "supports": "…" }],
  "context": { "everyday": [{ "text": {"ar": "…"}, "sourceIds?": [] }], "engineering": […],
               "assumptions": [{"ar": "…"}], "units": [{ "symbol": "Q(t)", "quantity": {"ar": "…"}, "unit": {"ar": "لتر/دقيقة"} }],
               "limitations": [{"ar": "…"}] },
  "misconceptions": [{ "id": "m-…", "text": {"ar": "…"}, "why": {"ar": "…"} }],          // ≥ 3
  "assessments": [{ "id": "a-…", "objectiveIds": ["o-…"], "kind": "prediction|reasoning|transfer",
                    "format": "numeric|choice", "prompt": {"ar": "… {q0} …"},
                    "numeric": { "answer": { "compute": "riemann", "args": {…} }        // OR
                                 "generator": { "compute": "ramp-volume", "ranges": { "q0": [10,30,5] } },
                                 "unit": {"ar": "لتر"}, "tolerance": { "type": "relative", "value": 0.01 }, "explain?": {"ar": "…"} },
                    "choice": { "options": [{ "id": "…", "text": {"ar": "…"}, "correct": false, "feedback": {"ar": "…"}, "misconceptionId?": "m-…" }] },
                    "feedback": { "correct": {"ar": "…"}, "wrong": {"ar": "…"} }, "hints?": [{"ar": "…"}], "misconceptionIds?": [] }],
  "stages": [{ "id": "st-…", "phase": "problem|prediction|experiment|explanation|equation|practice|challenge",
               "title": {"ar": "…"}, "body": {"ar": "…"}, "reveal?": {"ar": "…"},
               "interaction?": { "type": "flow-tank|riemann-sum|explainer|equation|question", "params": {…} },
               "assessmentIds?": ["a-…"] }],
  "animation?": { "durationSec": 30–60, "timeline": [{ "id": "e1", "t0": 0, "t1": 6, "action": "scene|fill|shade|rectangles|equation|label", "params": {…} }],
                  "captions": [{ "t0": 0, "t1": 6, "text": {"ar": "…"} }],
                  "narration": { "status": "none|recorded", "assets": [{ "id": "…", "kind": "recorded", "src": "assets/<id>/narration.mp3", "mime": "audio/mpeg", "durationSec?": 48 }] } },
  "unsupportedConcepts?": [{ "concept": "…", "reason": "…" }],                          // flagged for author review
  "review": { "status": "draft|in_review|approved|published|rejected", "contentHash?", "approvedBy?", "approvedAt?", "history": [] }
}
```

**Rules the validator enforces**

- **Teaching order:** stages must follow the phase order in the schema, and every phase must appear.
- **Assessment coverage:** every objective needs at least one prediction, reasoning or transfer assessment. Every assessment must be placed in a stage.
- **Computed answers:** numeric answers can only use named computations (`volume-at`, `volume-added`, `riemann`, `constant-flow-volume`, `ramp-volume`). The validator computes each one for several seeds.
- **Choice questions:** exactly one option is correct, and each wrong option should be linked to a misconception (otherwise it's a warning).
- **Animation:** 30–60 s long. Captions must be sorted, in Arabic, inside the duration, and must not overlap.
- **Text and links:** all text is plain (no markup or script URLs), and sources must be https links.
- **Interactions by objective:** each interaction declares which *skills* it serves, and a warning appears when no interaction teaches an objective's skill.
- **Unsupported interaction types:** these are errors, and the message tells the author how to flag the concept for review.

**Adding a lesson** that uses existing interaction types requires no code changes. Adding a **new interaction type** takes two steps: a catalogue entry with its parameter validator, and a renderer in `src/lab/registry.jsx`. A test fails if either side is missing.

## Human-review checklist (required for approval)

| Item | What to check |
|---|---|
| **Maths** (`math`) | <ul><li>Run every numeric answer in preview (they're computed, but check the *question* matches the computation).</li><li>Units: Q in L/min, t in min, V in L.</li><li>Check the tolerance on each question.</li><li>Check the rectangle table converges (left sums: n = 5 and n = 10 both differ by 5 L for this profile).</li></ul> |
| **Egyptian Arabic** (`arabic`) | <ul><li>Read every instruction, control, explanation and feedback line aloud.</li><li>It should sound natural and Egyptian, not formal or translated.</li><li>Terms should be consistent: معدل vs حجم vs حجم ابتدائي.</li></ul> |
| **Narration** (`narration`) | <ul><li>Listen to the uploaded recording, if there is one.</li><li>With no recording, confirm the captions are enough on their own.</li></ul> |
| **Synchronisation** (`sync`) | <ul><li>Play the explainer at 0.75×, 1× and 1.5×, and try pause, seek and replay.</li><li>Captions must match the scene: tank, meter, area, rectangles, equation.</li><li>Navigating away must stop audio.</li></ul> |
| **Learning clarity** (`clarity`) | <ul><li>Intuition comes before the equation.</li><li>Each wrong option explains a real misconception.</li><li>The examples, assumptions and limitations are correct.</li><li>Sources open and support their claims.</li></ul> |

Warnings must be acknowledged explicitly. AI or bot reviewer names are rejected.
