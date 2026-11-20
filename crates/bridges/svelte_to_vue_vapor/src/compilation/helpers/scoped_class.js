const $$scoped_class = (value, hash) => {
  const name = $$sclsx(value);
  return name == null || name === '' ? hash : name + ' ' + hash;
};
const $$scoped_spread = (value, hash) => ({ ...value, class: $$scoped_class(value.class, hash) });
