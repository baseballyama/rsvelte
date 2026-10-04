const $$resize_observers = new Map();
const $$resize_binding = (element, name, event, getter, setter) => {
  if (!$$lifecycle_once(element, 'bind:' + name)) return;
  const dimension = name === 'clientWidth' || name === 'clientHeight' || name === 'offsetWidth' || name === 'offsetHeight';
  const box = name === 'devicePixelContentBoxSize' ? 'device-pixel-content-box' : name === 'borderBoxSize' || dimension ? 'border-box' : 'content-box';
  let record = $$resize_observers.get(box);
  if (!record) {
    const listeners = new WeakMap();
    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => listeners.get(entry.target)?.forEach((callback) => callback(entry)));
    });
    record = { listeners, observer };
    $$resize_observers.set(box, record);
  }
  let callbacks = record.listeners.get(element);
  if (!callbacks) { callbacks = new Set(); record.listeners.set(element, callbacks); record.observer.observe(element, { box }); }
  const update = (entry) => setter(dimension ? element[name] : entry[name]);
  callbacks.add(update);
  if (dimension) $$watchPostEffect(() => $$untrack(() => setter(element[name])));
  $$onScopeDispose(() => {
    callbacks.delete(update);
    if (!callbacks.size) { record.listeners.delete(element); record.observer.unobserve(element); }
  });
};
