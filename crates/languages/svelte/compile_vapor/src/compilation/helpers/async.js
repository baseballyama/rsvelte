const $$async_cell = (getter, initialize = false) => {
  let ready;
  let fail;
  const instance = $$v_currentInstance;
  const result = $$v_shallowRef(undefined);
  result.resolved = $$v_shallowRef(false);
  if (initialize) result.ready = new Promise((resolve, reject) => { ready = resolve; fail = reject; });
  const boundary = $$v_inject(Symbol.for('rsvelte.async.boundary'), null);
  let pendingCount = 0;
  let pendingVersion = 0;
  const clearPending = () => {
    if (boundary) boundary.count.value -= pendingCount;
    pendingCount = 0;
    pendingVersion++;
  };
  let initialized = false;
  if (boundary) boundary.waiting++;
  const reads = new Map();
  let active = true;
  let version = 0;
  let queued = false;
  let root;
  const schedule = () => {
    if (!active || queued) return;
    queued = true;
    queueMicrotask(() => { queued = false; if (active) run(); });
  };
  const clear = () => {
    root?.stop();
    reads.forEach((effect) => effect.stop());
    reads.clear();
  };
  const run = () => {
    clear();
    let finish = () => {};
    if (boundary) {
      boundary.count.value++;
      pendingCount++;
      const epoch = pendingVersion;
      let pending = true;
      finish = () => {
        if (!pending || epoch !== pendingVersion) return;
        pending = false;
        pendingCount--;
        boundary.count.value--;
      };
    }
    const current = ++version;
    const read = (key, callback) => {
      if (!active || current !== version) return callback();
      let effect = reads.get(key);
      if (!effect) {
        effect = new $$v_ReactiveEffect(callback);
        effect.notify = () => { if (effect.dirty) schedule(); };
        reads.set(key, effect);
      } else effect.fn = callback;
      return effect.run();
    };
    root = new $$v_ReactiveEffect(() => getter(read));
    root.notify = () => { if (root.dirty) schedule(); };
    Promise.resolve(root.run()).then((value) => {
      finish();
      if (active && current === version) {
        clearPending();
        result.value = value;
        result.resolved.value = true;
        if (!initialized) {
          initialized = true;
          ready?.();
          if (boundary && --boundary.waiting === 0) boundary.initial.value = false;
        }
      }
    }, (error) => {
      finish();
      if (active && current === version) {
        if (initialize && !initialized) fail(error);
        else $$v_handleError(error, instance, 'render');
      }
    });
  };
  $$v_onScopeDispose(() => {
    active = false;
    ++version;
    clear();
    clearPending();
    if (boundary && !initialized && --boundary.waiting === 0) boundary.initial.value = false;
  });
  run();
  return result;
};
const $$async_derived = async (getter) => {
  const cell = $$async_cell(getter, true);
  await cell.ready;
  return cell;
};
