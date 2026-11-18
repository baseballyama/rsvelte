const $$make_derived = (server) => (getter) => {
  let value;
  let ready = false;
  if (server) {
    let override;
    return {
      get value() {
        if (override != null) return override;
        if (!ready) { value = getter(); ready = true; }
        return value;
      },
      set value(next) { override = next; }
    };
  }
  const effect = new $$ReactiveEffect(getter);
  const source = $$createState((track, trigger) => {
    let overridden = false;
    effect.notify = () => {
      if (effect.dirty) { ready = false; overridden = false; trigger(); }
    };
    const read = () => {
      if (!ready && !overridden) { value = effect.run(); ready = true; }
      return value;
    };
    return {
      get() { track(); return read(); },
      set(next) {
        const previous = read();
        value = next;
        overridden = true;
        if (!Object.is(previous, next)) trigger();
      }
    };
  });
  return $$createDerived({ get: () => source.value, set: (next) => { source.value = next; } });
};
