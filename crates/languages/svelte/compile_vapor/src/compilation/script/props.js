const $$prop_cell = (props, key, fallback, server, bindable) => {
  const unset = Symbol();
  const local = server ? { value: unset } : $$shallowRef(unset);
  let previous = props[key];
  let initialized = false;
  let defaultValue;
  const options = {
    get() {
      const current = props[key];
      if (!Object.is(current, previous)) {
        previous = current;
        local.value = unset;
      }
      if (local.value !== unset) return local.value;
      if (current !== undefined) {
        initialized = false;
        return current;
      }
      if (!initialized) {
        initialized = true;
        defaultValue = $$untrack(fallback);
        if (bindable && !server) defaultValue = $$state_proxy(defaultValue);
        const write = bindable ? props.__rsvelte_bindings?.[key] : undefined;
        if (write && defaultValue !== undefined) {
          if (!server) throw new Error(`props_invalid_value: bound prop '${key}' cannot be undefined when it has a fallback`);
          write(defaultValue);
        }
      }
      return defaultValue;
    },
    set(value) {
      if (bindable && !server) value = $$state_proxy(value);
      const write = bindable ? props.__rsvelte_bindings?.[key] : undefined;
      if (write) write(value);
      else local.value = value;
    }
  };
  if (!server) return $$createDerived(options);
  return {
    get value() { return options.get(); },
    set value(value) { options.set(value); }
  };
};
