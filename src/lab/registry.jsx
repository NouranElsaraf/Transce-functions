/**
 * Renderer registry: interaction type → component. Must cover every type in
 * engine/interactions/catalog.js (a test enforces this). Lessons that use only
 * these types render with no code changes.
 * @module lab/registry
 */
import FlowTankInteraction from './interactions/FlowTankInteraction.jsx';
import RiemannInteraction from './interactions/RiemannInteraction.jsx';
import ExplainerInteraction from './interactions/ExplainerInteraction.jsx';
import EquationInteraction from './interactions/EquationInteraction.jsx';

const QuestionOnly = () => null; // the stage's assessments render below every interaction

export const RENDERERS = {
  'flow-tank': FlowTankInteraction,
  'riemann-sum': RiemannInteraction,
  explainer: ExplainerInteraction,
  equation: EquationInteraction,
  question: QuestionOnly,
};
