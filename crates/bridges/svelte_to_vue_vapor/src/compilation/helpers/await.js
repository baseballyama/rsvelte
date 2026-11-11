const $$await_block = (getter, hasCatch) => {
  const state = $$shallowRef({ status: -1 });
  $$watchEffect((register) => {
    const value = getter();
    let active = true;
    register(() => { active = false; });
    if (value != null && typeof value.then === 'function') {
      let resolved = false;
      value.then(
        (value) => { resolved = true; if (active) state.value = { status: 1, value }; },
        (error) => {
          resolved = true;
          if (!active) return;
          state.value = { status: 2, error };
          if (!hasCatch) throw error;
        }
      );
      queueMicrotask(() => { if (active && !resolved) state.value = { status: 0 }; });
    } else {
      state.value = { status: 1, value };
    }
  });
  return state;
};
