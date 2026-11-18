let $$animation_context = null;
const $$animate = (element, key, getFunction, getParameter) => {
  if (!$$lifecycle_once(element, key)) return;
  const owner = $$animation_context;
  const record = { element, getFunction, getParameter, from: null, motion: null, root: $$transition_context };
  owner.records.add(record);
  $$onScopeDispose(() => {
    record.motion?.stop();
    owner.records.delete(record);
  });
};
const $$animated_for = (source, render, getKey) => {
  const owner = { records: new Set() };
  const item = (...args) => {
    const previous = $$animation_context;
    $$animation_context = owner;
    try { return render(...args); }
    finally { $$animation_context = previous; }
  };
  Object.defineProperty(item, 'length', { value: render.length });
  const fragment = $$v_createFor(source, item, getKey);
  const measure = () => owner.records.forEach((record) => {
    record.from = record.element.getBoundingClientRect();
  });
  const apply = () => owner.records.forEach((record) => {
    const from = record.from;
    record.from = null;
    if (!from || record.root?.leaving || !record.element.isConnected) return;
    record.motion?.stop();
    const to = record.element.getBoundingClientRect();
    if (from.top === to.top && from.left === to.left && from.right === to.right && from.bottom === to.bottom) return;
    const options = $$untrack(() => record.getFunction()(record.element, { from, to }, record.getParameter()));
    record.motion = $$transition_motion(record.element, options, undefined, 1, () => {}, () => {
      record.motion?.stop();
      record.motion = null;
    });
  });
  (fragment.bu ??= []).push(measure);
  (fragment.u ??= []).push(() => $$v_queuePostFlushCb(apply));
  return fragment;
};
