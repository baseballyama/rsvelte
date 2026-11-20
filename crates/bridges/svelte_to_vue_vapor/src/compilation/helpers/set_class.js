const $$set_class = (el, value, next) => {
  const prev = el.$$class;
  if (prev !== value || prev === undefined) {
    const name = $$to_class(value, next);
    if (name == null) el.removeAttribute('class');
    else el.setAttribute('class', name);
    el.$$class = value;
  } else if (el.$$classes !== next) {
    const before = el.$$classes;
    Object.keys(next).forEach((key) => {
      const present = !!next[key];
      if (before == null || present !== !!before[key]) {
        el.classList.toggle(key, present);
      }
    });
  }
  el.$$classes = next;
};
