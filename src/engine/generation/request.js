/**
 * Validates an author's generation request. Treated as untrusted input:
 * bounded lengths, no markup, known student levels, Egyptian Arabic default.
 * @module engine/generation/request
 */
import { STUDENT_LEVELS } from '../schema/lessonSchema.js';

const MARKUP = /<\s*\/?\s*[a-z!]|javascript:/i;

export function normalizeRequest(input) {
  const errors = [];
  const req = input && typeof input === 'object' ? input : {};
  const clean = (v, name, max) => {
    if (typeof v !== 'string' || !v.trim()) {
      errors.push(`${name} is required`);
      return '';
    }
    const s = v.trim().replace(/\s+/g, ' ');
    if (s.length > max) errors.push(`${name} is longer than ${max} characters`);
    if (MARKUP.test(s)) errors.push(`${name} must be plain text`);
    return s.slice(0, max);
  };
  const subject = clean(req.subject, 'subject', 120);
  const names = Array.isArray(req.lessonNames) ? req.lessonNames : typeof req.lessonNames === 'string' ? req.lessonNames.split('\n') : [];
  const lessonNames = names.map((n, i) => clean(n, `lessonNames[${i}]`, 160)).filter(Boolean);
  if (!lessonNames.length) errors.push('at least one lesson name is required');
  if (lessonNames.length > 5) errors.push('at most 5 lessons per request');
  const studentLevel = req.studentLevel ?? 'first-year-engineering';
  if (!STUDENT_LEVELS.includes(studentLevel)) errors.push(`studentLevel must be one of ${STUDENT_LEVELS.join(', ')}`);
  const language = req.language ?? 'ar-EG';
  if (language !== 'ar-EG') errors.push('only Egyptian Arabic (ar-EG) is supported');
  return { ok: errors.length === 0, errors, request: { subject, lessonNames, studentLevel, language } };
}
