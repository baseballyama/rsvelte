const $$custom_setters = new WeakMap();
const $$custom_values = new WeakMap();
const $$custom_element_data = (element, name, value) => {
  let values = $$custom_values.get(element);
  if (!values) {
    values = new Map();
    $$custom_values.set(element, values);
  }
  if (values.has(name) && Object.is(values.get(name), value)) return;
  const view = element.ownerDocument.defaultView ?? window;
  const registry = view.customElements;
  const registered = !registry || registry.get(element.getAttribute('is') || element.localName);
  let property = !registered && value !== null && typeof value === 'object';
  if (registered && name !== 'style') {
    let setters = $$custom_setters.get(element);
    if (!setters) {
      setters = new Set();
      const base = view.Element.prototype;
      for (let prototype = element; prototype && prototype !== base; prototype = Object.getPrototypeOf(prototype)) {
        for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(prototype))) {
          if (descriptor.set && key !== 'innerHTML' && key !== 'textContent' && key !== 'innerText') setters.add(key);
        }
      }
      $$custom_setters.set(element, setters);
    }
    property = setters.has(name);
  }
  $$untrack(() => {
    if (property) element[name] = value;
    else if (value == null) element.removeAttribute(name);
    else element.setAttribute(name, String(value));
    values.set(name, value);
  });
};
