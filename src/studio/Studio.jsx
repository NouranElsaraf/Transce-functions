/**
 * Authoring studio (#/studio): generate or import → validate → preview →
 * human review → approve → publish. Talks to the local studio server; every
 * rule (approval, invalidation, publishing) is enforced there, not by which
 * buttons are visible here.
 * @module studio/Studio
 */
import { useCallback, useEffect, useState } from 'react';
import LessonPlayer from '../lab/LessonPlayer.jsx';
import { REVIEW_CHECKLIST, STUDENT_LEVELS } from '../engine/schema/lessonSchema.js';
import { validateLesson } from '../engine/schema/lessonSchema.js';

const CHECK_LABEL = {
  math: 'الرياضة والأرقام اتراجعت (الإجابات محسوبة بالمحرك والوحدات صح)',
  arabic: 'العامية المصرية طبيعية وواضحة للطالب',
  narration: 'الصوت اتسمع واتراجع — أو مفيش صوت والترجمة كافية',
  sync: 'الترجمة والصوت والحركة متزامنين',
  clarity: 'الفكرة واضحة والمصادر اتراجعت',
};
const STATUS_LABEL = { draft: 'مسودة', in_review: 'في المراجعة', approved: 'متوافق عليه', published: 'منشور', rejected: 'مرفوض' };
const ORIGIN_LABEL = { 'ai-generated': 'مولّد بالذكاء الاصطناعي', imported: 'مستورد', demo: 'تجريبي يدوي', 'hand-authored': 'مكتوب يدوي' };

async function api(path, opts = {}) {
  const res = await fetch(`/api${path}`, {
    ...opts,
    headers: opts.body instanceof Blob || opts.body instanceof ArrayBuffer ? opts.headers : { 'content-type': 'application/json', ...opts.headers },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.message || body.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

function Report({ report }) {
  if (!report) return null;
  return (
    <div className="st-report">
      <p className={report.ok ? 'ok' : 'bad'}>{report.ok ? 'الـ schema سليم ✓' : `${report.errors.length} خطأ لازم يتصلح`}</p>
      {report.errors.length > 0 && (
        <ul className="bad">
          {report.errors.slice(0, 40).map((e, i) => (
            <li key={i} dir="ltr">
              <code>{e.path}</code> — {e.message}
            </li>
          ))}
        </ul>
      )}
      {report.warnings.length > 0 && (
        <>
          <p className="warn">تنبيهات لازم المراجع ياخد باله منها ({report.warnings.length}):</p>
          <ul className="warn">
            {report.warnings.map((w, i) => (
              <li key={i} dir="ltr">
                <code>{w.path}</code> — {w.message}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function GenerateForm({ health, onDone }) {
  const [form, setForm] = useState({ subject: '', lessonNames: '', studentLevel: 'first-year-engineering' });
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    try {
      const out = await api('/generate', { method: 'POST', body: JSON.stringify({ ...form, lessonNames: form.lessonNames.split('\n'), language: 'ar-EG' }) });
      setResult(out);
      onDone();
    } catch (err) {
      setResult({ status: 'error', message: err.message, ...err.body });
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="st-card" onSubmit={submit}>
      <h2>١. ولّد مسودة</h2>
      <p className={`st-provider ${health?.provider.available ? 'ok' : 'bad'}`}>
        مزوّد التوليد: <b dir="ltr">{health?.provider.name ?? '…'}</b>{' '}
        {health?.provider.available ? <span dir="ltr">({health.provider.model})</span> : <>— غير متاح: <span dir="ltr" lang="en">{health?.provider.reason}</span></>}
      </p>
      <label>
        المادة
        <input required maxLength={120} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Calculus I" />
      </label>
      <label>
        أسماء الدروس (درس في كل سطر، لحد ٥)
        <textarea required rows={3} value={form.lessonNames} onChange={(e) => setForm({ ...form, lessonNames: e.target.value })} />
      </label>
      <label>
        مستوى الطالب
        <select value={form.studentLevel} onChange={(e) => setForm({ ...form, studentLevel: e.target.value })}>
          {STUDENT_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </label>
      <p className="st-hint">اللغة: عامية مصرية (ar-EG). المسودة بتتحفظ «مسودة» ومش بتتنشر لوحدها أبدًا.</p>
      <button type="submit" className="lab-btn" disabled={busy}>
        {busy ? 'بيولّد…' : 'ولّد مسودة'}
      </button>
      {result && (
        <div className="st-result" role="status">
          {result.status === 'unavailable' && <p className="bad">التوليد الحي مش شغال: {result.message} (الطلب اتسجل برقم {result.requestId}).</p>}
          {result.status === 'rejected-request' && <p className="bad">{(result.errors || []).join(' · ')}</p>}
          {result.status === 'error' && <p className="bad">{result.message}</p>}
          {result.results?.map((r) => (
            <p key={r.lessonName}>
              {r.lessonName}: {r.status} {r.lessonId && <code dir="ltr">{r.lessonId}</code>} {r.error}
            </p>
          ))}
        </div>
      )}
    </form>
  );
}

function ImportForm({ onDone }) {
  const [text, setText] = useState('');
  const [msg, setMsg] = useState(null);
  const run = async (replace = false) => {
    setMsg(null);
    let lesson;
    try {
      lesson = JSON.parse(text);
    } catch {
      setMsg({ bad: 'ده مش JSON سليم.' });
      return;
    }
    try {
      const out = await api('/lessons/import', { method: 'POST', body: JSON.stringify({ lesson, replace, by: 'author' }) });
      setMsg({ ok: `اتستورد كمسودة: ${out.lesson.id}`, report: out.report });
      onDone(out.lesson.id);
    } catch (err) {
      setMsg({ bad: err.message, exists: err.status === 409 });
    }
  };
  return (
    <div className="st-card">
      <h2>٢. استورد درس (JSON)</h2>
      <p className="st-hint">المحتوى المستورد بيتعامل على إنه غير موثوق: بيتراجع بالـ schema وبيدخل كمسودة.</p>
      <input
        type="file"
        accept="application/json,.json"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f && f.size < 1024 * 1024) setText(await f.text());
        }}
      />
      <textarea rows={5} dir="ltr" value={text} onChange={(e) => setText(e.target.value)} placeholder='{"schemaVersion": 1, ...}' />
      <div className="row">
        <button type="button" className="lab-btn" onClick={() => run(false)} disabled={!text.trim()}>
          استورد
        </button>
        {msg?.exists && (
          <button type="button" className="lab-btn ghost" onClick={() => run(true)}>
            استبدل الموجود (هيلغي أي موافقة)
          </button>
        )}
      </div>
      {msg?.bad && <p className="bad">{msg.bad}</p>}
      {msg?.ok && <p className="ok">{msg.ok}</p>}
      <Report report={msg?.report} />
    </div>
  );
}

function ReviewPanel({ data, reload }) {
  const { lesson, report, published } = data;
  const status = lesson.review?.status;
  const [by, setBy] = useState('');
  const [checklist, setChecklist] = useState({});
  const [ack, setAck] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);
  const act = async (path, body) => {
    setError(null);
    try {
      await api(`/lessons/${lesson.id}/${path}`, { method: 'POST', body: JSON.stringify(body) });
      reload();
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <div className="st-card">
      <h2>٤. المراجعة البشرية</h2>
      <p>
        الحالة: <b>{STATUS_LABEL[status]}</b>
        {lesson.review?.approvedBy && (
          <>
            {' '}
            · وافق عليه: {lesson.review.approvedBy} ({lesson.review.approvedAt?.slice(0, 10)})
          </>
        )}
        {published && <> · النسخة المنشورة للطلبة موجودة</>}
      </p>
      {(status === 'draft' || status === 'rejected') && (
        <button type="button" className="lab-btn" disabled={!report.ok} onClick={() => act('submit', { by: by || 'author' })}>
          ابعته للمراجعة
        </button>
      )}
      {status === 'in_review' && (
        <form
          className="st-approve"
          onSubmit={(e) => {
            e.preventDefault();
            act('approve', { by, checklist, acknowledgeFlags: ack, notes });
          }}
        >
          <label>
            اسم المراجع (إنسان)
            <input required minLength={2} value={by} onChange={(e) => setBy(e.target.value)} />
          </label>
          <fieldset>
            <legend>قايمة المراجعة</legend>
            {REVIEW_CHECKLIST.map((k) => (
              <label key={k} className="check">
                <input type="checkbox" checked={Boolean(checklist[k])} onChange={(e) => setChecklist({ ...checklist, [k]: e.target.checked })} /> {CHECK_LABEL[k]}
              </label>
            ))}
          </fieldset>
          {report.warnings.length > 0 && (
            <label className="check warn">
              <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} /> قريت التنبيهات ({report.warnings.length}) وموافق عليها
            </label>
          )}
          <label>
            ملاحظات
            <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
          <div className="row">
            <button type="submit" className="lab-btn">
              وافق
            </button>
            <button type="button" className="lab-btn ghost" onClick={() => act('reject', { by: by || 'reviewer', notes })}>
              ارفض
            </button>
          </div>
        </form>
      )}
      {status === 'approved' && (
        <div className="row">
          <button type="button" className="lab-btn" onClick={() => act('publish', { by: by || lesson.review.approvedBy })}>
            انشر للطلبة
          </button>
          <button type="button" className="lab-btn ghost" onClick={() => act('reject', { by: by || 'reviewer', notes })}>
            ارجعه
          </button>
        </div>
      )}
      {error && <p className="bad">{error}</p>}
      <details>
        <summary>السجل</summary>
        <ol className="st-history" dir="ltr">
          {(lesson.review?.history ?? []).map((h, i) => (
            <li key={i}>
              {h.at?.slice(0, 19)} — {h.action} by {h.by}
              {h.note ? ` (${h.note})` : ''}
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}

function LessonDetail({ id, reload: reloadList }) {
  const [data, setData] = useState(null);
  const [json, setJson] = useState('');
  const [msg, setMsg] = useState(null);
  const [preview, setPreview] = useState(false);
  const load = useCallback(async () => {
    const out = await api(`/lessons/${id}`);
    setData(out);
    const { review, ...content } = out.lesson;
    setJson(JSON.stringify(content, null, 2));
  }, [id]);
  useEffect(() => {
    load().catch((e) => setMsg(e.message));
  }, [load]);
  if (!data) return <p className="lab-note">{msg ?? 'بيحمّل…'}</p>;
  const reload = () => {
    load();
    reloadList();
  };
  let draft = null;
  try {
    draft = JSON.parse(json);
  } catch {
    draft = null;
  }
  const liveReport = draft ? validateLesson(draft) : null;

  const save = async () => {
    setMsg(null);
    try {
      await api(`/lessons/${id}`, { method: 'PUT', body: JSON.stringify({ content: draft, by: 'author' }) });
      setMsg('اتحفظ. أي موافقة سابقة اتلغت لأن المحتوى اتغير.');
      reload();
    } catch (e) {
      setMsg(e.message);
    }
  };

  const upload = async (file) => {
    if (!file) return;
    const durationSec = await new Promise((resolve) => {
      const a = new Audio();
      a.preload = 'metadata';
      a.onloadedmetadata = () => resolve(a.duration);
      a.onerror = () => resolve(undefined);
      a.src = URL.createObjectURL(file);
    });
    try {
      await fetch(`/api/lessons/${id}/narration?by=author${Number.isFinite(durationSec) ? `&durationSec=${durationSec}` : ''}`, { method: 'POST', headers: { 'content-type': file.type }, body: file }).then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).message);
      });
      setMsg('التسجيل اترفع. المحتوى اتغير، فالدرس رجع مسودة ومحتاج مراجعة تاني.');
      reload();
    } catch (e) {
      setMsg(e.message);
    }
  };

  return (
    <div className="st-detail">
      <div className="st-card">
        <h2>٣. راجع وعدّل: {data.lesson.meta?.title?.ar ?? id}</h2>
        <p>
          المصدر: <b>{ORIGIN_LABEL[data.lesson.provenance?.origin] ?? data.lesson.provenance?.origin}</b> — <span dir="ltr">{data.lesson.provenance?.note}</span>
        </p>
        <Report report={data.report} />
        <div className="row">
          <button type="button" className="lab-btn" disabled={!data.report.ok} onClick={() => setPreview((p) => !p)}>
            {preview ? 'اقفل المعاينة' : 'معاينة زي الطالب'}
          </button>
          <label className="lab-btn ghost file">
            ارفع تسجيل صوتي للشرح (mp3/m4a/ogg/wav/webm)
            <input type="file" accept="audio/*" onChange={(e) => upload(e.target.files?.[0])} />
          </label>
        </div>
        {msg && <p role="status">{msg}</p>}
        <details>
          <summary>عدّل الـ JSON (أي تعديل بيلغي الموافقة)</summary>
          <textarea className="st-json" dir="ltr" rows={18} value={json} onChange={(e) => setJson(e.target.value)} spellCheck={false} />
          {liveReport && !liveReport.ok && <p className="bad">في {liveReport.errors.length} خطأ في التعديل ده.</p>}
          {!draft && <p className="bad">JSON مش سليم.</p>}
          <button type="button" className="lab-btn" disabled={!draft} onClick={save}>
            احفظ كمسودة
          </button>
        </details>
      </div>
      {preview && data.report.ok && (
        <div className="st-preview">
          <LessonPlayer lesson={data.lesson} mode="preview" resolveAsset={(src) => `/content/${src}`} />
        </div>
      )}
      <ReviewPanel data={data} reload={reload} />
    </div>
  );
}

export default function Studio({ onExit }) {
  const [health, setHealth] = useState(null);
  const [offline, setOffline] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [selected, setSelected] = useState(null);
  const reload = useCallback(async () => {
    try {
      setHealth(await api('/health'));
      setLessons(await api('/lessons'));
      setOffline(false);
    } catch {
      setOffline(true);
    }
  }, []);
  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <main className="lab studio" dir="rtl" lang="ar">
      <header className="lab-head">
        <button type="button" className="lab-btn ghost" onClick={onExit}>
          رجوع
        </button>
        <div>
          <p className="lab-kicker">للمؤلفين والمراجعين</p>
          <h1>استوديو الدروس</h1>
          <p className="lab-tagline">ولّد أو استورد ← راجع الـ schema ← عاين ← مراجعة بشرية ← وافق ← انشر.</p>
        </div>
      </header>
      {offline ? (
        <div className="st-card">
          <h2>السيرفر المحلي مش شغال</h2>
          <p>
            شغّل <code dir="ltr">npm run studio</code> وافتح الصفحة دي تاني. الاستوديو بيشتغل على جهازك بس (127.0.0.1).
          </p>
        </div>
      ) : (
        <>
          <div className="st-grid">
            <GenerateForm health={health} onDone={reload} />
            <ImportForm
              onDone={(id) => {
                reload();
                setSelected(id);
              }}
            />
          </div>
          <div className="st-card">
            <h2>الدروس</h2>
            <table className="lab-table st-table">
              <thead>
                <tr>
                  <th scope="col">الدرس</th>
                  <th scope="col">المصدر</th>
                  <th scope="col">الحالة</th>
                  <th scope="col">الـ schema</th>
                  <th scope="col">للطلبة</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((l) => (
                  <tr key={l.id} className={selected === l.id ? 'is-selected' : ''}>
                    <td>
                      <button type="button" className="linkish" onClick={() => setSelected(l.id)}>
                        {l.title}
                      </button>
                    </td>
                    <td>{ORIGIN_LABEL[l.origin] ?? l.origin}</td>
                    <td>{STATUS_LABEL[l.status] ?? l.status}</td>
                    <td>{l.valid ? `سليم${l.warnings ? ` · ${l.warnings} تنبيه` : ''}` : `${l.errors} خطأ`}</td>
                    <td>{l.live ? 'منشور' : '—'}</td>
                  </tr>
                ))}
                {!lessons.length && (
                  <tr>
                    <td colSpan={5}>مفيش دروس لسه.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {selected && <LessonDetail key={selected} id={selected} reload={reload} />}
        </>
      )}
    </main>
  );
}
