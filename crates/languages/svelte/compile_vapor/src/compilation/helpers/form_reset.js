const $$reset_bindings = new WeakMap();
let $$reset_count = 0;
const $$reset_listener = (event) => {
  queueMicrotask(() => {
    if (!event.defaultPrevented) {
      for (const element of event.target.elements) $$reset_bindings.get(element)?.forEach((update) => update());
    }
  });
};
const $$form_reset = (element, name, update) => {
  if (!$$lifecycle_once(element, 'reset:' + name)) return;
  let bindings = $$reset_bindings.get(element);
  if (!bindings) { bindings = new Map(); $$reset_bindings.set(element, bindings); }
  bindings.set(name, update);
  if ($$reset_count++ === 0) document.addEventListener('reset', $$reset_listener, true);
  $$onScopeDispose(() => {
    bindings.delete(name);
    if (--$$reset_count === 0) document.removeEventListener('reset', $$reset_listener, true);
  });
};
const $$text_initial = (element, value, setter) => {
  if ($$lifecycle_once(element, 'text:initial') && value == null && element.value !== '') setter(element.value);
};
const $$reset_value = (element, value) => element.localName === 'select'
  ? element.multiple ? Array.from(element.selectedOptions, (option) => option.value) : element.value
  : value;
