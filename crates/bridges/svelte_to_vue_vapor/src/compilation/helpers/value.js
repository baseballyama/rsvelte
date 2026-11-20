const $$value = (el, v) => {
  const last = el.$$value;
  el.$$value = v ?? undefined;
  if (last === el.$$value || el.value === v) return;
  el.value = v ?? '';
};
