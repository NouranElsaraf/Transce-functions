/**
 * Lesson schema v1 and its validator.
 *
 * Every lesson — AI-generated, imported or hand-authored — is untrusted data
 * until `validateLesson` passes. The validator is strict: unknown keys,
 * unsupported interaction types, uncomputable answers, malformed timelines or
 * unreachable objectives are errors. Soft issues (e.g. unsupported concepts the
 * author listed) are warnings that a reviewer must acknowledge before approval.
 *
 * Teaching flow enforced by stage order:
 *   problem → prediction → experiment → explanation → equation → practice → challenge
 * @module engine/schema/lessonSchema
 */
import { COMPUTE, compute, pickValues } from '../math/compute.js';
import { INTERACTIONS, SKILLS, isSupportedInteraction } from '../interactions/catalog.js';

export const SCHEMA_VERSION = 1;
export const PHASES = ['problem', 'prediction', 'experiment', 'explanation', 'equation', 'practice', 'challenge'];
export const REVIEW_STATUSES = ['draft', 'in_review', 'approved', 'published', 'rejected'];
export const STUDENT_LEVELS = ['high-school', 'first-year-university', 'first-year-engineering', 'general'];
export const ORIGINS = ['ai-generated', 'imported', 'demo', 'hand-authored'];
export const ANIMATION_ACTIONS = ['scene', 'fill', 'shade', 'rectangles', 'equation', 'label'];
export const REVIEW_CHECKLIST = ['math', 'arabic', 'narration', 'sync', 'clarity'];

const ID = /^[a-z0-9][a-z0-9-]{1,59}$/;
const ARABIC = /[؀-ۿ]/;
const MARKUP = /<\s*\/?\s*[a-z!]|javascript:|data:text\/html/i;
const MAX_TEXT = 1200;

/** Collects errors and warnings with JSON-path-like locations. */
class Report {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }
  err(path, message) {
    this.errors.push({ path, message });
  }
  warn(path, message) {
    this.warnings.push({ path, message });
  }
}

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

function keys(r, path, v, allowed, required = []) {
  if (!isObj(v)) {
    r.err(path, 'must be an object');
    return false;
  }
  for (const k of Object.keys(v)) if (!allowed.includes(k)) r.err(`${path}.${k}`, 'unknown field');
  for (const k of required) if (v[k] === undefined) r.err(`${path}.${k}`, 'is required');
  return true;
}

function text(r, path, v, { max = MAX_TEXT, min = 1 } = {}) {
  if (typeof v !== 'string') return r.err(path, 'must be a string');
  if (v.trim().length < min) r.err(path, 'must not be empty');
  if (v.length > max) r.err(path, `is longer than ${max} characters`);
  if (MARKUP.test(v)) r.err(path, 'must be plain text (markup and script URLs are not allowed)');
  return undefined;
}

/** Localised text: Egyptian Arabic is required, English optional. */
function loc(r, path, v, opts) {
  if (!keys(r, path, v, ['ar', 'en'], ['ar'])) return;
  text(r, `${path}.ar`, v.ar, opts);
  if (typeof v.ar === 'string' && !ARABIC.test(v.ar)) r.err(`${path}.ar`, 'must be written in Arabic');
  if (v.en !== undefined) text(r, `${path}.en`, v.en, opts);
}

function arr(r, path, v, { min = 0, max = 100 } = {}) {
  if (!Array.isArray(v)) {
    r.err(path, 'must be an array');
    return [];
  }
  if (v.length < min) r.err(path, `needs at least ${min} item(s)`);
  if (v.length > max) r.err(path, `has more than ${max} items`);
  return v;
}

function ids(r, path, list) {
  const seen = new Set();
  list.forEach((item, i) => {
    if (!isObj(item)) return;
    if (typeof item.id !== 'string' || !ID.test(item.id)) r.err(`${path}[${i}].id`, 'must be a lowercase slug');
    else if (seen.has(item.id)) r.err(`${path}[${i}].id`, `duplicate id "${item.id}"`);
    seen.add(item.id);
  });
  return seen;
}

function refs(r, path, v, known, what) {
  arr(r, path, v).forEach((id, i) => {
    if (!known.has(id)) r.err(`${path}[${i}]`, `unknown ${what} "${id}"`);
  });
}

function validateMeta(r, m) {
  if (!keys(r, 'meta', m, ['title', 'subject', 'topic', 'studentLevel', 'language', 'estimatedMinutes', 'tagline'], ['title', 'subject', 'topic', 'studentLevel', 'language', 'estimatedMinutes', 'tagline'])) return;
  loc(r, 'meta.title', m.title, { max: 120 });
  loc(r, 'meta.tagline', m.tagline, { max: 240 });
  text(r, 'meta.subject', m.subject, { max: 120 });
  text(r, 'meta.topic', m.topic, { max: 120 });
  if (!STUDENT_LEVELS.includes(m.studentLevel)) r.err('meta.studentLevel', `must be one of ${STUDENT_LEVELS.join(', ')}`);
  if (m.language !== 'ar-EG') r.err('meta.language', 'only "ar-EG" (Egyptian Arabic) is supported in schema v1');
  if (!isNum(m.estimatedMinutes) || m.estimatedMinutes < 3 || m.estimatedMinutes > 120) r.err('meta.estimatedMinutes', 'must be 3–120');
}

function validateProvenance(r, p) {
  if (!keys(r, 'provenance', p, ['origin', 'provider', 'model', 'createdAt', 'note'], ['origin', 'createdAt', 'note'])) return;
  if (!ORIGINS.includes(p.origin)) r.err('provenance.origin', `must be one of ${ORIGINS.join(', ')}`);
  if (p.origin === 'ai-generated' && (!p.provider || !p.model)) r.err('provenance', 'AI-generated content must name its provider and model');
  if (Number.isNaN(Date.parse(p.createdAt))) r.err('provenance.createdAt', 'must be an ISO date');
  text(r, 'provenance.note', p.note, { max: 400 });
  for (const k of ['provider', 'model']) if (p[k] !== undefined) text(r, `provenance.${k}`, p[k], { max: 80 });
}

function validateSources(r, list) {
  const known = ids(r, 'sources', list);
  list.forEach((s, i) => {
    const path = `sources[${i}]`;
    if (!keys(r, path, s, ['id', 'title', 'publisher', 'url', 'accessed', 'supports'], ['id', 'title', 'publisher', 'url', 'accessed', 'supports'])) return;
    text(r, `${path}.title`, s.title, { max: 200 });
    text(r, `${path}.publisher`, s.publisher, { max: 120 });
    text(r, `${path}.supports`, s.supports, { max: 400 });
    if (typeof s.url !== 'string' || !/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/[^\s<>"]*)?$/i.test(s.url)) r.err(`${path}.url`, 'must be an https URL');
    if (typeof s.accessed !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s.accessed)) r.err(`${path}.accessed`, 'must be YYYY-MM-DD');
  });
  return known;
}

function validateContext(r, c, sourceIds) {
  if (!keys(r, 'context', c, ['everyday', 'engineering', 'assumptions', 'units', 'limitations'], ['everyday', 'engineering', 'assumptions', 'units', 'limitations'])) return;
  for (const kind of ['everyday', 'engineering']) {
    arr(r, `context.${kind}`, c[kind], { min: 1, max: 6 }).forEach((ex, i) => {
      const path = `context.${kind}[${i}]`;
      if (!keys(r, path, ex, ['text', 'sourceIds'], ['text'])) return;
      loc(r, `${path}.text`, ex.text);
      if (ex.sourceIds !== undefined) refs(r, `${path}.sourceIds`, ex.sourceIds, sourceIds, 'source');
    });
  }
  arr(r, 'context.assumptions', c.assumptions, { min: 1, max: 8 }).forEach((a, i) => loc(r, `context.assumptions[${i}]`, a));
  arr(r, 'context.limitations', c.limitations, { min: 1, max: 8 }).forEach((a, i) => loc(r, `context.limitations[${i}]`, a));
  arr(r, 'context.units', c.units, { min: 1, max: 12 }).forEach((u, i) => {
    const path = `context.units[${i}]`;
    if (!keys(r, path, u, ['symbol', 'quantity', 'unit'], ['symbol', 'quantity', 'unit'])) return;
    text(r, `${path}.symbol`, u.symbol, { max: 12 });
    loc(r, `${path}.quantity`, u.quantity, { max: 80 });
    loc(r, `${path}.unit`, u.unit, { max: 40 });
  });
}

/** Resolve the numeric answer for an assessment (computed, never trusted from content). */
export function resolveNumeric(numeric, seed = 1) {
  if (numeric.answer) return { value: compute(numeric.answer.compute, numeric.answer.args), values: {} };
  const values = pickValues(numeric.generator.ranges, seed);
  const args = { ...numeric.generator.fixed, ...values };
  return { value: compute(numeric.generator.compute, args), values: args };
}

function validateNumeric(r, path, n) {
  if (!keys(r, path, n, ['answer', 'generator', 'unit', 'tolerance', 'explain'], ['unit', 'tolerance'])) return;
  loc(r, `${path}.unit`, n.unit, { max: 30 });
  if (!keys(r, `${path}.tolerance`, n.tolerance, ['type', 'value'], ['type', 'value'])) return;
  if (!['relative', 'absolute'].includes(n.tolerance.type)) r.err(`${path}.tolerance.type`, 'must be relative or absolute');
  if (!isNum(n.tolerance.value) || n.tolerance.value <= 0 || (n.tolerance.type === 'relative' && n.tolerance.value > 0.5)) r.err(`${path}.tolerance.value`, 'must be > 0 (relative ≤ 0.5)');
  if (n.explain !== undefined) loc(r, `${path}.explain`, n.explain);
  if (Boolean(n.answer) === Boolean(n.generator)) {
    r.err(path, 'needs exactly one of answer or generator');
    return;
  }
  if (n.answer) {
    if (!keys(r, `${path}.answer`, n.answer, ['compute', 'args'], ['compute', 'args'])) return;
    if (!COMPUTE[n.answer.compute]) return r.err(`${path}.answer.compute`, `unknown computation "${n.answer.compute}"`);
  } else {
    const g = n.generator;
    if (!keys(r, `${path}.generator`, g, ['compute', 'ranges', 'fixed'], ['compute', 'ranges'])) return;
    if (!COMPUTE[g.compute]) return r.err(`${path}.generator.compute`, `unknown computation "${g.compute}"`);
    if (!isObj(g.ranges) || !Object.keys(g.ranges).length) return r.err(`${path}.generator.ranges`, 'must name at least one range');
    for (const [k, range] of Object.entries(g.ranges)) {
      if (!Array.isArray(range) || range.length !== 3 || !range.every(isNum) || range[0] > range[1] || range[2] <= 0) r.err(`${path}.generator.ranges.${k}`, 'must be [min, max, step] with min ≤ max, step > 0');
    }
  }
  // Prove the answer is computable for a spread of seeds.
  for (const seed of [1, 2, 3, 42, 1234]) {
    try {
      resolveNumeric(n, seed);
    } catch (e) {
      r.err(path, `answer cannot be computed: ${e.message}`);
      break;
    }
  }
  return undefined;
}

function validateAssessments(r, list, objectiveIds, misconceptionIds) {
  const known = ids(r, 'assessments', list);
  list.forEach((a, i) => {
    const path = `assessments[${i}]`;
    if (!keys(r, path, a, ['id', 'objectiveIds', 'kind', 'format', 'prompt', 'numeric', 'choice', 'feedback', 'hints', 'misconceptionIds'], ['id', 'objectiveIds', 'kind', 'format', 'prompt', 'feedback'])) return;
    refs(r, `${path}.objectiveIds`, a.objectiveIds, objectiveIds, 'objective');
    if (Array.isArray(a.objectiveIds) && !a.objectiveIds.length) r.err(`${path}.objectiveIds`, 'must assess at least one objective');
    if (!['prediction', 'reasoning', 'transfer'].includes(a.kind)) r.err(`${path}.kind`, 'must be prediction, reasoning or transfer');
    loc(r, `${path}.prompt`, a.prompt);
    if (keys(r, `${path}.feedback`, a.feedback, ['correct', 'wrong'], ['correct', 'wrong'])) {
      loc(r, `${path}.feedback.correct`, a.feedback.correct);
      loc(r, `${path}.feedback.wrong`, a.feedback.wrong);
    }
    if (a.hints !== undefined) arr(r, `${path}.hints`, a.hints, { max: 4 }).forEach((h, j) => loc(r, `${path}.hints[${j}]`, h));
    if (a.misconceptionIds !== undefined) refs(r, `${path}.misconceptionIds`, a.misconceptionIds, misconceptionIds, 'misconception');
    if (a.format === 'numeric') {
      if (a.choice) r.err(`${path}.choice`, 'not allowed for numeric assessments');
      if (!a.numeric) r.err(`${path}.numeric`, 'is required');
      else validateNumeric(r, `${path}.numeric`, a.numeric);
      if (a.numeric?.generator && !/\{[a-zA-Z]/.test(a.prompt?.ar ?? '')) r.warn(`${path}.prompt`, 'generated values are not shown in the prompt');
    } else if (a.format === 'choice') {
      if (a.numeric) r.err(`${path}.numeric`, 'not allowed for choice assessments');
      if (!keys(r, `${path}.choice`, a.choice, ['options'], ['options'])) return;
      const options = arr(r, `${path}.choice.options`, a.choice.options, { min: 2, max: 6 });
      ids(r, `${path}.choice.options`, options);
      let correct = 0;
      options.forEach((o, j) => {
        const op = `${path}.choice.options[${j}]`;
        if (!keys(r, op, o, ['id', 'text', 'correct', 'feedback', 'misconceptionId'], ['id', 'text', 'correct', 'feedback'])) return;
        loc(r, `${op}.text`, o.text, { max: 200 });
        loc(r, `${op}.feedback`, o.feedback);
        if (typeof o.correct !== 'boolean') r.err(`${op}.correct`, 'must be boolean');
        if (o.correct) correct += 1;
        if (o.misconceptionId !== undefined && !misconceptionIds.has(o.misconceptionId)) r.err(`${op}.misconceptionId`, `unknown misconception "${o.misconceptionId}"`);
        if (!o.correct && o.misconceptionId === undefined) r.warn(`${op}`, 'wrong option is not linked to a misconception');
      });
      if (correct !== 1) r.err(`${path}.choice.options`, 'needs exactly one correct option');
    } else {
      r.err(`${path}.format`, 'must be numeric or choice');
    }
  });
  return known;
}

function validateStages(r, list, assessmentIds, hasAnimation) {
  ids(r, 'stages', list);
  let lastPhase = -1;
  const phasesSeen = new Set();
  const placed = new Set();
  list.forEach((s, i) => {
    const path = `stages[${i}]`;
    if (!keys(r, path, s, ['id', 'phase', 'title', 'body', 'interaction', 'assessmentIds', 'reveal'], ['id', 'phase', 'title', 'body'])) return;
    const phase = PHASES.indexOf(s.phase);
    if (phase < 0) r.err(`${path}.phase`, `must be one of ${PHASES.join(', ')}`);
    else {
      if (phase < lastPhase) r.err(`${path}.phase`, `"${s.phase}" comes after "${PHASES[lastPhase]}" — stages must follow ${PHASES.join(' → ')}`);
      lastPhase = Math.max(lastPhase, phase);
      phasesSeen.add(s.phase);
    }
    loc(r, `${path}.title`, s.title, { max: 120 });
    loc(r, `${path}.body`, s.body);
    if (s.reveal !== undefined) loc(r, `${path}.reveal`, s.reveal);
    if (s.assessmentIds !== undefined) {
      refs(r, `${path}.assessmentIds`, s.assessmentIds, assessmentIds, 'assessment');
      (s.assessmentIds || []).forEach((id) => placed.add(id));
    }
    if (s.interaction !== undefined) {
      if (!keys(r, `${path}.interaction`, s.interaction, ['type', 'params'], ['type', 'params'])) return;
      const { type, params } = s.interaction;
      if (!isSupportedInteraction(type)) {
        r.err(`${path}.interaction.type`, `unsupported interaction "${type}" — flag this concept for author review or use one of: ${Object.keys(INTERACTIONS).join(', ')}`);
        return;
      }
      if (!isObj(params)) return r.err(`${path}.interaction.params`, 'must be an object');
      INTERACTIONS[type].validate(params, (m) => r.err(`${path}.interaction.params`, m));
      if (INTERACTIONS[type].requiresAnimation && !hasAnimation) r.err(`${path}.interaction`, `"${type}" needs an animation block`);
      if (type === 'question' && !(s.assessmentIds || []).length) r.err(`${path}.assessmentIds`, 'a question stage needs at least one assessment');
    }
    return undefined;
  });
  for (const p of PHASES) if (!phasesSeen.has(p)) r.err('stages', `missing the "${p}" phase`);
  for (const id of assessmentIds) if (!placed.has(id)) r.err('assessments', `"${id}" is not placed in any stage`);
}

function validateAnimation(r, a) {
  if (!keys(r, 'animation', a, ['durationSec', 'timeline', 'captions', 'narration'], ['durationSec', 'timeline', 'captions', 'narration'])) return;
  const d = a.durationSec;
  if (!isNum(d) || d < 30 || d > 60) r.err('animation.durationSec', 'must be 30–60 seconds');
  const inRange = (path, item) => {
    if (!isNum(item.t0) || !isNum(item.t1) || item.t0 < 0 || item.t1 <= item.t0 || item.t1 > d) r.err(path, `needs 0 ≤ t0 < t1 ≤ ${d}`);
  };
  const timeline = arr(r, 'animation.timeline', a.timeline, { min: 1, max: 40 });
  ids(r, 'animation.timeline', timeline);
  timeline.forEach((ev, i) => {
    const path = `animation.timeline[${i}]`;
    if (!keys(r, path, ev, ['id', 't0', 't1', 'action', 'params'], ['id', 't0', 't1', 'action'])) return;
    inRange(path, ev);
    if (!ANIMATION_ACTIONS.includes(ev.action)) r.err(`${path}.action`, `unsupported animation action "${ev.action}"`);
    if (ev.params !== undefined && !isObj(ev.params)) r.err(`${path}.params`, 'must be an object');
    if (ev.action === 'label' && ev.params) loc(r, `${path}.params.text`, ev.params.text, { max: 120 });
  });
  const captions = arr(r, 'animation.captions', a.captions, { min: 1, max: 60 });
  captions.forEach((c, i) => {
    const path = `animation.captions[${i}]`;
    if (!keys(r, path, c, ['t0', 't1', 'text'], ['t0', 't1', 'text'])) return;
    inRange(path, c);
    loc(r, `${path}.text`, c.text, { max: 240 });
    if (i > 0 && isNum(captions[i - 1]?.t1) && c.t0 < captions[i - 1].t1) r.err(path, 'overlaps the previous caption (captions must be sorted and non-overlapping)');
  });
  const n = a.narration;
  if (!keys(r, 'animation.narration', n, ['status', 'assets'], ['status', 'assets'])) return;
  if (!['none', 'recorded'].includes(n.status)) r.err('animation.narration.status', 'must be none or recorded');
  const assets = arr(r, 'animation.narration.assets', n.assets, { max: 4 });
  assets.forEach((as, i) => {
    const path = `animation.narration.assets[${i}]`;
    if (!keys(r, path, as, ['id', 'kind', 'src', 'mime', 'durationSec', 'voice', 'provider', 'note'], ['id', 'kind', 'src', 'mime'])) return;
    if (!['recorded', 'synthesized'].includes(as.kind)) r.err(`${path}.kind`, 'must be recorded or synthesized');
    if (typeof as.src !== 'string' || !/^assets\/[a-z0-9-]+\/[a-z0-9._-]+\.(mp3|m4a|ogg|wav|webm)$/i.test(as.src)) r.err(`${path}.src`, 'must be a file under assets/<lesson>/');
    if (!/^audio\/(mpeg|mp4|ogg|wav|x-wav|webm)$/.test(as.mime ?? '')) r.err(`${path}.mime`, 'unsupported audio type');
    if (as.durationSec !== undefined && (!isNum(as.durationSec) || Math.abs(as.durationSec - d) > 3)) r.warn(`${path}.durationSec`, 'recording length differs from the animation by more than 3 s — check synchronisation');
  });
  if (n.status === 'recorded' && !assets.length) r.err('animation.narration', 'status is recorded but no recording is attached');
  if (n.status === 'none') r.warn('animation.narration', 'no narration audio — captions only');
}

/**
 * Validate a lesson object. Returns `{ ok, errors, warnings }`.
 * Never throws for bad content (only for programming errors).
 */
export function validateLesson(lesson) {
  const r = new Report();
  const allowed = ['schemaVersion', 'id', 'meta', 'provenance', 'objectives', 'prerequisites', 'sources', 'context', 'misconceptions', 'assessments', 'stages', 'animation', 'unsupportedConcepts', 'review'];
  if (!keys(r, '$', lesson, allowed, allowed.filter((k) => !['animation', 'unsupportedConcepts', 'review'].includes(k)))) {
    return { ok: false, errors: r.errors, warnings: r.warnings };
  }
  if (lesson.schemaVersion !== SCHEMA_VERSION) r.err('schemaVersion', `must be ${SCHEMA_VERSION}`);
  if (typeof lesson.id !== 'string' || !ID.test(lesson.id)) r.err('id', 'must be a lowercase slug (a–z, 0–9, -)');
  validateMeta(r, lesson.meta);
  validateProvenance(r, lesson.provenance);

  const objectives = arr(r, 'objectives', lesson.objectives, { min: 1, max: 8 });
  const objectiveIds = ids(r, 'objectives', objectives);
  objectives.forEach((o, i) => {
    if (!keys(r, `objectives[${i}]`, o, ['id', 'text', 'skill'], ['id', 'text', 'skill'])) return;
    loc(r, `objectives[${i}].text`, o.text);
    if (!SKILLS.includes(o.skill)) r.err(`objectives[${i}].skill`, `must be one of ${SKILLS.join(', ')}`);
  });

  arr(r, 'prerequisites', lesson.prerequisites, { max: 10 }).forEach((p, i) => {
    if (!keys(r, `prerequisites[${i}]`, p, ['id', 'text', 'levelRef'], ['id', 'text'])) return;
    loc(r, `prerequisites[${i}].text`, p.text);
    if (p.levelRef !== undefined) text(r, `prerequisites[${i}].levelRef`, p.levelRef, { max: 60 });
  });
  ids(r, 'prerequisites', lesson.prerequisites || []);

  const sourceIds = validateSources(r, arr(r, 'sources', lesson.sources, { min: 1, max: 20 }));
  validateContext(r, lesson.context, sourceIds);

  const misconceptions = arr(r, 'misconceptions', lesson.misconceptions, { min: 3, max: 12 });
  const misconceptionIds = ids(r, 'misconceptions', misconceptions);
  misconceptions.forEach((m, i) => {
    if (!keys(r, `misconceptions[${i}]`, m, ['id', 'text', 'why'], ['id', 'text', 'why'])) return;
    loc(r, `misconceptions[${i}].text`, m.text);
    loc(r, `misconceptions[${i}].why`, m.why);
  });

  const assessments = arr(r, 'assessments', lesson.assessments, { min: 1, max: 30 });
  const assessmentIds = validateAssessments(r, assessments, objectiveIds, misconceptionIds);

  // Every objective must be assessed by reasoning, prediction or transfer.
  for (const id of objectiveIds) {
    if (!assessments.some((a) => Array.isArray(a?.objectiveIds) && a.objectiveIds.includes(id))) r.err('objectives', `"${id}" is never assessed`);
  }

  if (lesson.animation !== undefined) validateAnimation(r, lesson.animation);
  validateStages(r, arr(r, 'stages', lesson.stages, { min: PHASES.length, max: 30 }), assessmentIds, lesson.animation !== undefined);

  // Interactions chosen should serve the objectives' skills (selection by objective).
  const servedSkills = new Set();
  for (const s of lesson.stages || []) {
    const def = s?.interaction && INTERACTIONS[s.interaction.type];
    if (def) def.serves.forEach((k) => servedSkills.add(k));
  }
  objectives.forEach((o, i) => {
    if (o && SKILLS.includes(o.skill) && !servedSkills.has(o.skill)) r.warn(`objectives[${i}]`, `no interaction in this lesson is designed for the "${o.skill}" skill`);
  });

  if (lesson.unsupportedConcepts !== undefined) {
    arr(r, 'unsupportedConcepts', lesson.unsupportedConcepts, { max: 20 }).forEach((u, i) => {
      if (!keys(r, `unsupportedConcepts[${i}]`, u, ['concept', 'reason'], ['concept', 'reason'])) return;
      text(r, `unsupportedConcepts[${i}].concept`, u.concept, { max: 200 });
      text(r, `unsupportedConcepts[${i}].reason`, u.reason, { max: 400 });
      r.warn(`unsupportedConcepts[${i}]`, `flagged for author review: ${u.concept}`);
    });
  }

  if (lesson.review !== undefined) {
    const rv = lesson.review;
    if (keys(r, 'review', rv, ['status', 'contentHash', 'approvedBy', 'approvedAt', 'publishedAt', 'flagsAcknowledged', 'checklist', 'notes', 'history'], ['status', 'history'])) {
      if (!REVIEW_STATUSES.includes(rv.status)) r.err('review.status', `must be one of ${REVIEW_STATUSES.join(', ')}`);
      arr(r, 'review.history', rv.history, { max: 500 });
    }
  }

  return { ok: r.errors.length === 0, errors: r.errors, warnings: r.warnings };
}
