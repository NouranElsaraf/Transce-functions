/**
 * Rectangle sums vs the exact integral, with a slider for the number of
 * intervals and a choice of sample point. A small table shows convergence.
 * @module lab/interactions/RiemannInteraction
 */
import { useMemo, useRef, useState } from 'react';
import Slider from '../../components/Slider.jsx';
import Plot from '../../components/Plot.jsx';
import { exactVolume, flowAt, riemannSum } from '../../engine/math/accumulation.js';
import { useLabColors } from '../apparatus/useLabColors.js';
import { fmt } from '../format.js';

const METHOD_LABEL = { left: 'من الشمال', right: 'من اليمين', midpoint: 'من النص' };

export default function RiemannInteraction({ params }) {
  const { profile, a, b, nMin, nMax, initialN, methods } = params;
  const [n, setN] = useState(initialN);
  const [method, setMethod] = useState(methods[0]);
  const ref = useRef(null);
  const c = useLabColors(ref);
  const exact = exactVolume(profile, a, b);
  const { sum, rects } = riemannSum(profile, a, b, n, method);
  const qMax = Math.max(...profile.map((p) => p[1]));
  const table = useMemo(
    () => [5, 10, 20, 40].filter((k) => k >= nMin && k <= nMax).map((k) => ({ k, s: riemannSum(profile, a, b, k, method).sum })),
    [profile, a, b, method, nMin, nMax],
  );

  return (
    <div className="riemann" ref={ref}>
      <div dir="ltr">
        <Plot
          x={[a - 0.4, b + 0.4]}
          y={[-qMax * 0.06, qMax * 1.2]}
          height={300}
          ariaLabel={`${n} rectangles, sum ${Math.round(sum)} litres versus exact ${Math.round(exact)} litres`}
          xLabel="t (min) →"
          yLabel="↑ Q (L/min)"
          underlay={(ctx, view) => {
            if (!c) return;
            for (const r of rects) {
              const [x1, y1] = view.toPx(r.t0, r.height);
              const [x2, y2] = view.toPx(r.t1, 0);
              ctx.fillStyle = c.approxFill;
              ctx.strokeStyle = c.approx;
              ctx.lineWidth = n > 30 ? 0.6 : 1.4;
              ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
              ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
            }
          }}
          fns={c ? [{ f: (x) => flowAt(profile, x), color: c.rate, width: 3, domain: [a, b] }] : []}
        />
      </div>
      <div className="bench-controls">
        <Slider label="عدد المستطيلات n" value={n} min={nMin} max={nMax} step={1} onChange={setN} />
        <div className="segmented" role="radiogroup" aria-label="ارتفاع كل مستطيل بيتاخد منين">
          {methods.map((m) => (
            <button key={m} type="button" role="radio" aria-checked={method === m} className={method === m ? 'is-on' : ''} onClick={() => setMethod(m)}>
              {METHOD_LABEL[m]}
            </button>
          ))}
        </div>
      </div>
      <dl className="gauges">
        <div className="g-approx">
          <dt>مجموع المستطيلات</dt>
          <dd>
            {fmt(sum, 1)} <small>لتر</small>
          </dd>
        </div>
        <div className="g-area">
          <dt>المساحة المضبوطة</dt>
          <dd>
            {fmt(exact, 1)} <small>لتر</small>
          </dd>
        </div>
        <div>
          <dt>الفرق</dt>
          <dd>
            {fmt(Math.abs(sum - exact), 2)} <small>لتر</small>
          </dd>
        </div>
      </dl>
      <table className="lab-table">
        <caption>كل ما n تكبر ({METHOD_LABEL[method]})</caption>
        <thead>
          <tr>
            <th scope="col">n</th>
            <th scope="col">المجموع (لتر)</th>
            <th scope="col">الفرق (لتر)</th>
          </tr>
        </thead>
        <tbody>
          {table.map(({ k, s }) => (
            <tr key={k}>
              <td>{k}</td>
              <td>{fmt(s, 2)}</td>
              <td>{fmt(Math.abs(s - exact), 3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
