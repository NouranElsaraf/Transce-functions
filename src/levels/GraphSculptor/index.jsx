/**
 * Level 3 — Graph Sculptor: transformations of functions, discovered by matching shapes.
 * @module GraphSculptor
 */
import meta from './meta.js';
import SculptStep from './SculptStep.jsx';
import { STEP_CONFIGS } from './steps.js';

const steps = STEP_CONFIGS.map((config, i) => {
  const Step = ({ api }) => <SculptStep api={api} config={config} />;
  Step.displayName = `SculptStep_${meta.steps[i].id}`;
  return Step;
});

export default { meta, steps };
