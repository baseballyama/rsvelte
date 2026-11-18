const $$window_scroll = (element, name, getter, setter, owner) => {
  if (!$$lifecycle_once(element, name, owner)) return;
  const scrollQuietMs = 100;
  let scrolling = false;
  let timeout;
  const settle = () => { scrolling = false; };
  const update = () => {
    scrolling = true;
    clearTimeout(timeout);
    timeout = setTimeout(settle, scrollQuietMs);
    $$untrack(() => setter(element[name]));
  };
  let first = true;
  $$watchPostEffect(() => {
    const value = getter();
    if (first) first = false;
    else if (!scrolling && value != null) {
      scrolling = true;
      clearTimeout(timeout);
      if (name === 'scrollX') element.scrollTo(value, element.scrollY);
      else element.scrollTo(element.scrollX, value);
      timeout = setTimeout(settle, scrollQuietMs);
    }
  });
  element.addEventListener('scroll', update, { passive: true });
  update();
  $$onScopeDispose(() => {
    element.removeEventListener('scroll', update);
    clearTimeout(timeout);
  });
};
