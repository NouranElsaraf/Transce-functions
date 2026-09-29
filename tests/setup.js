// Browser APIs jsdom doesn't provide. Canvas drawing is skipped (getContext → null),
// which the components already handle, so these tests exercise structure and logic.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
HTMLCanvasElement.prototype.getContext = () => null;
window.matchMedia ??= () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
window.scrollTo = () => {};
globalThis.requestAnimationFrame ??= (cb) => setTimeout(() => cb(performance.now()), 16);
globalThis.cancelAnimationFrame ??= (id) => clearTimeout(id);
