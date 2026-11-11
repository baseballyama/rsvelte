const $$autofocused = new WeakSet();
const $$autofocus = (element, value) => {
  if ($$autofocused.has(element)) return;
  $$autofocused.add(element);
  if (value) {
    const body = document.body;
    element.autofocus = true;
    queueMicrotask(() => {
      if (document.activeElement === body) element.focus();
    });
  }
};
const $$hidden_values = new WeakMap();
const $$hidden = (element, value) => {
  if ($$hidden_values.has(element) && $$hidden_values.get(element) === value) return;
  $$hidden_values.set(element, value);
  if (value == null) element.removeAttribute('hidden');
  else if (typeof value === 'string') element.setAttribute('hidden', value);
  else element.hidden = value;
};
