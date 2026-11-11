const $$boundary_component = $$v_defineVaporComponent({
  inheritAttrs: false,
  props: ['children', 'failed', 'onerror', 'pending'],
  setup(props) {
    const instance = $$v_currentInstance;
    const failure = $$v_shallowRef(null);
    const boundary = { count: $$v_shallowRef(0), initial: $$v_shallowRef(true), waiting: 0 };
    $$v_provide(Symbol.for('rsvelte.async.boundary'), boundary);
    let active = true;
    let handling = false;
    let version = 0;
    $$v_onScopeDispose(() => active = false);
    $$v_onErrorCaptured((error, component) => {
      const options = $$untrack(() => ({ failed: props.failed, onerror: props.onerror }));
      if (!options.failed && !options.onerror) return;
      let content = component;
      while (content.parent && content.parent !== instance) content = content.parent;
      content.scope.stop();
      const current = ++version;
      const reset = () => {
        if (handling) throw new Error('svelte_boundary_reset_onerror');
        if (active && current === version) failure.value = null;
      };
      handling = true;
      try { $$untrack(() => options.onerror?.(error, reset)); }
      catch (nextError) {
        $$v_handleError(nextError, instance, 'ec');
        return false;
      }
      finally { handling = false; }
      failure.value = { error, reset, failed: options.failed };
      return false;
    });
    const content = $$v_defineVaporComponent({ inheritAttrs: false, setup: () => props.children?.() ?? [] });
    return $$v_createIf(() => failure.value !== null, () => {
      const { error, reset, failed } = failure.value;
      return failed?.($$v_shallowRef(error), $$v_shallowRef(reset)) ?? [];
    }, () => {
      boundary.initial.value = true;
      const block = $$v_createComponent(content);
      return $$v_createIf(() => boundary.initial.value && boundary.count.value > 0,
        () => props.pending?.() ?? [], () => block);
    });
  }
});
