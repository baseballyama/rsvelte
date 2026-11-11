const $$async_setup = (task) => {
  const instance = $$v_currentInstance;
  const scope = $$v_effectScope();
  const mounted = instance.__rsvelte_async_mount = [];
  const anchor = document.createComment('');
  const fragment = Object.assign(new $$v_VaporFragment([]), { anchor });
  const cancelled = Symbol();
  let active = true;
  let previous = null;
  const context = {
    suspend(value) {
      if (previous) { $$v_restoreCurrentInstance(previous); previous = null; }
      else $$v_setCurrentInstance(null, undefined);
      return value;
    },
    resume(value) {
      if (!active) throw cancelled;
      previous = $$v_setCurrentInstance(instance, scope);
      return value;
    },
    finish() {
      if (previous) { $$v_restoreCurrentInstance(previous); previous = null; }
    }
  };
  $$v_onScopeDispose(() => { active = false; scope.stop(); });
  const result = scope.run(() => task(context));
  Promise.resolve(result).then((nodes) => {
    context.finish();
    if (!active) return;
    fragment.nodes = nodes;
    if (anchor.parentNode) $$v_insert(nodes, anchor.parentNode, anchor);
    delete instance.__rsvelte_async_mount;
    $$v_queuePostFlushCb(() => { if (active) mounted.forEach((callback) => callback()); });
  }, (error) => {
    context.finish();
    if (active && error !== cancelled) $$v_handleError(error, instance, 'setup');
  });
  return fragment;
};
