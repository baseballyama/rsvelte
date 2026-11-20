const $$once = (el, f) => {
  if (el.$$once === true) return;
  el.$$once = true;
  f();
};
