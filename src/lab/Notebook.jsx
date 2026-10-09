/**
 * The notebook margin: objectives with mastery marks, and — collapsed until
 * wanted — everyday/engineering examples, units, assumptions, model limits and
 * sources. Explanations stay out of the way of the experiment.
 * @module lab/Notebook
 */
export default function Notebook({ lesson, entry }) {
  const c = lesson.context;
  const sourceTitle = (id) => lesson.sources.find((s) => s.id === id)?.publisher;
  return (
    <aside className="notebook" aria-label="الكراسة">
      <section>
        <h2>الأهداف</h2>
        <ul className="objective-list">
          {lesson.objectives.map((o) => (
            <li key={o.id} className={entry?.objectives?.[o.id] ? 'is-done' : ''}>
              {o.text.ar}
            </li>
          ))}
        </ul>
      </section>
      <details>
        <summary>فين بنشوف ده في الحياة؟</summary>
        <ul>
          {c.everyday.map((e) => (
            <li key={e.text.ar}>{e.text.ar}</li>
          ))}
        </ul>
      </details>
      <details>
        <summary>المهندس بيستخدمه فين؟</summary>
        <ul>
          {c.engineering.map((e) => (
            <li key={e.text.ar}>
              {e.text.ar} {e.sourceIds?.length > 0 && <small className="cite">({e.sourceIds.map(sourceTitle).join('، ')})</small>}
            </li>
          ))}
        </ul>
      </details>
      <details>
        <summary>الوحدات</summary>
        <table className="lab-table">
          <tbody>
            {c.units.map((u) => (
              <tr key={u.symbol}>
                <td dir="ltr">
                  <i>{u.symbol}</i>
                </td>
                <td>{u.quantity.ar}</td>
                <td>{u.unit.ar}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
      <details>
        <summary>افتراضات الموديل وحدوده</summary>
        <p className="nb-label">افترضنا:</p>
        <ul>
          {c.assumptions.map((a) => (
            <li key={a.ar}>{a.ar}</li>
          ))}
        </ul>
        <p className="nb-label">حدود الموديل:</p>
        <ul>
          {c.limitations.map((a) => (
            <li key={a.ar}>{a.ar}</li>
          ))}
        </ul>
      </details>
      <details>
        <summary>المصادر</summary>
        <ul className="sources" dir="ltr" lang="en">
          {lesson.sources.map((s) => (
            <li key={s.id}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">
                {s.title}
              </a>{' '}
              — {s.publisher} (accessed {s.accessed})
            </li>
          ))}
        </ul>
      </details>
    </aside>
  );
}
