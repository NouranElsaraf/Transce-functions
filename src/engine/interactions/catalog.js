/**
 * Catalogue of supported interaction types: what each one teaches (skills),
 * its parameters, and how to validate them. Pure data + validators — no React —
 * so the schema validator, the generation prompt and the renderer registry all
 * share one source of truth.
 *
 * Adding a lesson that only uses these types needs no renderer change. A new
 * type needs an entry here AND a component in `src/lab/registry.jsx`.
 * @module engine/interactions/catalog
 */
import { assertProfile } from '../math/accumulation.js';

/** Learning skills an objective can target; interactions declare which they serve. */
export const SKILLS = ['context', 'intuition', 'accumulation', 'approximation', 'formalization', 'unit-distinction', 'computation', 'transfer'];

const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

function checkKeys(params, allowed, err) {
  for (const k of Object.keys(params)) if (!allowed.includes(k)) err(`unknown parameter "${k}"`);
}

function checkProfile(profile, err) {
  try {
    assertProfile(profile);
  } catch (e) {
    err(`profile: ${e.message}`);
  }
}

export const INTERACTIONS = {
  'flow-tank': {
    description: 'Tank + flow-rate graph kept in sync; optional valve (scales the flow) and time scrubber; shades the area under Q up to the current time; models overflow explicitly.',
    serves: ['context', 'accumulation', 'unit-distinction', 'intuition'],
    params: ['profile', 'initialVolume', 'capacity', 'duration', 'controls', 'showArea'],
    validate(p, err) {
      checkKeys(p, this.params, err);
      checkProfile(p.profile, err);
      if (!isNum(p.initialVolume) || p.initialVolume < 0) err('initialVolume must be ≥ 0 (L)');
      if (!isNum(p.capacity) || p.capacity <= 0) err('capacity must be > 0 (L)');
      if (isNum(p.initialVolume) && isNum(p.capacity) && p.initialVolume > p.capacity) err('initialVolume exceeds capacity');
      if (!isNum(p.duration) || p.duration <= 0 || p.duration > 600) err('duration must be in (0, 600] min');
      const controls = p.controls ?? [];
      if (!Array.isArray(controls) || controls.some((c) => !['play', 'time', 'valve'].includes(c))) err('controls may only contain play, time, valve');
      if (p.showArea !== undefined && typeof p.showArea !== 'boolean') err('showArea must be boolean');
    },
  },
  'riemann-sum': {
    description: 'Rectangle sums under the flow-rate curve with a slider for the number of intervals and a choice of sample point; compares with the exact area.',
    serves: ['approximation', 'accumulation', 'computation'],
    params: ['profile', 'a', 'b', 'nMin', 'nMax', 'initialN', 'methods'],
    validate(p, err) {
      checkKeys(p, this.params, err);
      checkProfile(p.profile, err);
      if (!isNum(p.a) || !isNum(p.b) || p.b <= p.a) err('need a < b');
      for (const k of ['nMin', 'nMax', 'initialN']) if (!Number.isInteger(p[k]) || p[k] < 1 || p[k] > 200) err(`${k} must be an integer in [1, 200]`);
      if (p.nMin > p.nMax || p.initialN < p.nMin || p.initialN > p.nMax) err('need nMin ≤ initialN ≤ nMax');
      if (!Array.isArray(p.methods) || !p.methods.length || p.methods.some((m) => !['left', 'right', 'midpoint'].includes(m))) err('methods must be a non-empty subset of left, right, midpoint');
    },
  },
  explainer: {
    description: 'Plays the lesson animation (one timeline: scenes, captions, narration), then hands the same simulation to the student to explore.',
    serves: ['intuition', 'accumulation', 'approximation'],
    params: ['profile', 'initialVolume', 'capacity', 'duration'],
    requiresAnimation: true,
    validate(p, err) {
      checkKeys(p, this.params, err);
      checkProfile(p.profile, err);
      if (!isNum(p.initialVolume) || !isNum(p.capacity) || p.initialVolume > p.capacity) err('need 0 ≤ initialVolume ≤ capacity');
      if (!isNum(p.duration) || p.duration <= 0) err('duration must be > 0 (min)');
    },
  },
  equation: {
    description: 'Reveals an equation built from safe tokens, with a legend giving each symbol’s meaning and unit.',
    serves: ['formalization', 'unit-distinction'],
    params: ['tokens', 'legend'],
    validate(p, err) {
      checkKeys(p, this.params, err);
      if (!Array.isArray(p.tokens) || !p.tokens.length) err('tokens must be a non-empty array');
      else p.tokens.forEach((t, i) => validateToken(t, (m) => err(`tokens[${i}]: ${m}`)));
      if (!Array.isArray(p.legend)) err('legend must be an array');
      else
        p.legend.forEach((row, i) => {
          if (!row || typeof row.symbol !== 'string' || typeof row.unit !== 'string' || !row.meaning?.ar) err(`legend[${i}] needs symbol, meaning.ar and unit`);
        });
    },
  },
  question: {
    description: 'Practice container: shows the stage’s assessments (numeric with units, or multiple choice) with worked, explanatory feedback. Assessments can sit under any interaction; this one adds no visual model.',
    serves: ['computation', 'transfer'],
    params: [],
    validate(p, err) {
      checkKeys(p, this.params, err);
    },
  },
};

const TOKEN_KINDS = ['text', 'var', 'sub', 'sup', 'int', 'op'];

/** Equation tokens: a tiny safe language — no HTML, no LaTeX execution. */
export function validateToken(t, err) {
  if (!t || typeof t !== 'object' || !TOKEN_KINDS.includes(t.kind)) return err(`kind must be one of ${TOKEN_KINDS.join(', ')}`);
  if (t.kind === 'int') {
    if (typeof t.lower !== 'string' || typeof t.upper !== 'string') err('int needs lower and upper strings');
  } else if (typeof t.value !== 'string' || !t.value.length || t.value.length > 40) err('value must be a short string');
  if (t.kind === 'sub' || t.kind === 'sup') {
    if (typeof t.base !== 'string') err(`${t.kind} needs a base string`);
  }
  return undefined;
}

/** Interaction types that can serve a learning skill — used to pick by objective. */
export function interactionsForSkill(skill) {
  return Object.entries(INTERACTIONS)
    .filter(([, def]) => def.serves.includes(skill))
    .map(([type]) => type);
}

export const isSupportedInteraction = (type) => Object.prototype.hasOwnProperty.call(INTERACTIONS, type);
