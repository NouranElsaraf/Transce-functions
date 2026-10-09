/**
 * Equation built from safe tokens (always rendered left-to-right inside the
 * RTL page), with a legend of meanings and units.
 * @module lab/interactions/EquationInteraction
 */
export function EquationTokens({ tokens }) {
  return (
    <span className="eq" dir="ltr" role="math">
      {tokens.map((t, i) => {
        switch (t.kind) {
          case 'var':
            return <i key={i}>{t.value}</i>;
          case 'op':
            return <span key={i} className="eq-op">{t.value}</span>;
          case 'sub':
            return (
              <i key={i}>
                {t.base}
                <sub>{t.value}</sub>
              </i>
            );
          case 'sup':
            return (
              <i key={i}>
                {t.base}
                <sup>{t.value}</sup>
              </i>
            );
          case 'int':
            return (
              <span key={i} className="eq-int">
                <span className="eq-int-sign">∫</span>
                <span className="eq-int-limits">
                  <sup>{t.upper}</sup>
                  <sub>{t.lower}</sub>
                </span>
              </span>
            );
          default:
            return <span key={i}>{t.value}</span>;
        }
      })}
    </span>
  );
}

export default function EquationInteraction({ params }) {
  return (
    <div className="equation-card">
      <EquationTokens tokens={params.tokens} />
      <table className="lab-table">
        <thead>
          <tr>
            <th scope="col">الرمز</th>
            <th scope="col">معناه</th>
            <th scope="col">الوحدة</th>
          </tr>
        </thead>
        <tbody>
          {params.legend.map((row) => (
            <tr key={row.symbol}>
              <td dir="ltr">
                <i>{row.symbol}</i>
              </td>
              <td>{row.meaning.ar}</td>
              <td dir="ltr">{row.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
