const $$keys = (o, seen = [], out = []) => {
  if (o == null) return out;
  Object.getOwnPropertyNames(o).forEach((k) => {
    if (seen.indexOf(k) < 0) {
      seen.push(k);
      if (Object.prototype.propertyIsEnumerable.call(o, k)) out.push(k);
    }
  });
  return $$keys(Object.getPrototypeOf(o), seen, out);
};
const $$clsx = (mix) => {
  if (typeof mix === 'string' || typeof mix === 'number') return '' + mix;
  if (typeof mix !== 'object' || mix === null) return '';
  if (Array.isArray(mix)) {
    return Array.from({ length: mix.length }, (_, k) => mix[k])
      .filter((x) => x).map((x) => $$clsx(x)).filter((y) => y).join(' ');
  }
  return $$keys(mix).filter((k) => mix[k]).join(' ');
};
const $$sclsx = (v) => typeof v === 'object' ? $$clsx(v) : v ?? '';
