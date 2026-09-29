/**
 * Shared frame for every lock: the vault strip on top, then a normal StepLayout.
 * When the lock opens, its digit is revealed in the strip.
 * @module EscapeRoom/LockFrame
 */
import { useEffect } from 'react';
import StepLayout from '../../components/StepLayout.jsx';
import VaultBar from './VaultBar.jsx';
import { CODE, markSolved } from './vault.js';

export default function LockFrame({ index, done, children, ...layout }) {
  useEffect(() => {
    if (done) markSolved(index);
  }, [done, index]);

  return (
    <>
      <VaultBar solved={done ? index + 1 : index} current={index} />
      <StepLayout
        {...layout}
        done={done}
        insightTitle={`Lock ${index + 1} open — digit ${CODE[index]}`}
        continueLabel={index + 1 < CODE.length ? 'Next lock' : 'To the door'}
      >
        {children}
      </StepLayout>
    </>
  );
}
