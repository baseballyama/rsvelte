const $$class = (v) => {
  const c = '' + (typeof v === 'object' ? (v ? $$clsx(v) : '') : v ?? '');
  return c === '' ? null : c;
};
