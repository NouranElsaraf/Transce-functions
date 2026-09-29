/**
 * Standard frame for a step: prompt → interactive stage → insight → continue.
 *
 * Steps only decide *when* they are `done`; the layout handles hints,
 * teacher "reveal" mode and the Continue button so every step feels consistent.
 * @module StepLayout
 */
import Button from './Button.jsx';
import HintButton from './HintButton.jsx';
import Insight from './Insight.jsx';

export default function StepLayout({
  api,
  eyebrow,
  prompt,
  sub,
  hint,
  done = false,
  insight,
  insightTitle,
  formula,
  continueLabel = 'Continue',
  side,
  children,
}) {
  const showInsight = (done || api.reveal) && insight;
  return (
    <div className="step">
      <header className="step-prompt">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h2>{prompt}</h2>
        {sub && <p className="step-sub">{sub}</p>}
      </header>

      <div className={`step-body ${side ? 'has-side' : ''}`}>
        <div className="step-stage">{children}</div>
        {side && <aside className="step-side">{side}</aside>}
      </div>

      {!done && <HintButton key={String(prompt)} hint={hint} api={api} />}

      {showInsight && (
        <Insight title={insightTitle} formula={formula}>
          {insight}
        </Insight>
      )}

      {(done || api.reveal) && (
        <div className="step-actions">
          <Button size="lg" iconRight="right" onClick={api.complete} className={done ? 'pulse-once' : ''}>
            {done ? continueLabel : 'Skip step (teacher)'}
          </Button>
        </div>
      )}
    </div>
  );
}
