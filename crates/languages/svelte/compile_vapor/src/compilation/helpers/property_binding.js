const $$property_binding = (element, name, event, getter, setter, readonly) => {
  if (!$$lifecycle_once(element, 'bind:' + name)) return;
  const update = () => setter(name === 'focused' ? element === document.activeElement : element[name]);
  const events = event.split(' ');
  events.forEach((event) => element.addEventListener(event, update));
  $$onScopeDispose(() => events.forEach((event) => element.removeEventListener(event, update)));
  if (readonly) update();
  else $$watchPostEffect(() => {
    const value = getter();
    if (name === 'innerHTML' || name === 'innerText' || name === 'textContent') {
      if (element[name] !== value) {
        if (value == null) setter(element[name]);
        else element[name] = String(value);
      }
    } else element[name] = value;
  });
};
