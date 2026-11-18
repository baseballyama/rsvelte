const $$effect_run = (callback, register, state) => {
  const scope = $$effectScope();
  state.failed = true;
  const cleanup = scope.run(() => $$tracked(callback));
  state.failed = false;
  state.cleanup = typeof cleanup === 'function' ? cleanup : null;
  register(() => {
    scope.stop();
    state.cleanup?.();
  });
};
const $$effect_watch = (callback, watch, options) => {
  const state = { cleanup: null, failed: false };
  // A failed rerun keeps its previous cleanup until the effect is destroyed.
  $$onScopeDispose(() => { if (state.failed) state.cleanup?.(); });
  const instance = $$v_currentInstance;
  const scope = $$v_getCurrentScope();
  watch((register) => {
    const previous = $$v_setCurrentInstance(instance, scope);
    try { $$effect_run(callback, register, state); }
    finally { $$v_restoreCurrentInstance(previous); }
  }, options);
};
const $$effect = (callback) => {
  if (typeof window !== 'undefined') $$effect_watch(callback, $$watchPostEffect);
};
const $$effect_pre = (callback) => {
  if (typeof window !== 'undefined') $$effect_watch(callback, $$watchEffect, { flush: 'pre' });
};
const $$effect_root = (callback) => {
  const scope = $$effectScope(true);
  const cleanup = scope.run(() => $$untrack(callback));
  let active = true;
  return () => {
    if (!active) return;
    active = false;
    scope.stop();
    if (typeof cleanup === 'function') cleanup();
  };
};
const $$snapshot = (value, seen = new Map(), original = null) => {
  if (value !== null && typeof value === 'object') {
    if (seen.has(value)) return seen.get(value);
    if (value instanceof Map) return new Map(value);
    if (value instanceof Set) return new Set(value);
    const array = Array.isArray(value);
    if (array || Object.getPrototypeOf(value) === Object.prototype) {
      const result = array ? Array(value.length) : {};
      seen.set(value, result);
      if (original !== null) seen.set(original, result);
      if (array) {
        for (let index = 0; index < value.length; index++) {
          if (index in value) result[index] = $$snapshot(value[index], seen);
        }
      } else {
        Object.keys(value).forEach((key) => { result[key] = $$snapshot(value[key], seen); });
      }
      return result;
    }
    if (value instanceof Date) { value.getTime(); return structuredClone(value); }
    if (typeof value.toJSON === 'function') return $$snapshot(value.toJSON(), seen, value);
  }
  if (typeof EventTarget !== 'undefined' && value instanceof EventTarget) return value;
  try { return structuredClone(value); } catch { return value; }
};
let $$tracking_depth = 0;
const $$tracked = (callback) => {
  $$tracking_depth++;
  try { return callback(); } finally { $$tracking_depth--; }
};
const $$effect_tracking = () => $$tracking_depth > 0;
const $$untrack = (callback) => {
  const depth = $$tracking_depth;
  $$tracking_depth = 0;
  const effect = new $$ReactiveEffect(callback);
  try { return effect.run(); } finally { effect.stop(); $$tracking_depth = depth; }
};
