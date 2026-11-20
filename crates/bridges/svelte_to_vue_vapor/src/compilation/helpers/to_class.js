const $$ws = [32, 9, 10, 13, 12, 160, 11, 65279]
  .map((c) => String.fromCharCode(c));
const $$remove_class = (name, key, a) => {
  const at = name.indexOf(key, a);
  if (at < 0) return name;
  const b = at + key.length;
  if ((at === 0 || $$ws.includes(name[at - 1]))
    && (b === name.length || $$ws.includes(name[b]))) {
    const head = at === 0 ? '' : name.substring(0, at);
    return $$remove_class(head + name.substring(b + 1), key, at);
  }
  return $$remove_class(name, key, b);
};
const $$to_class = (value, directives) => {
  let name = value == null ? '' : '' + value;
  if (directives) {
    Object.keys(directives).forEach((key) => {
      if (directives[key]) name = name ? name + ' ' + key : key;
      else if (name.length) name = $$remove_class(name, key, 0);
    });
  }
  return name === '' ? null : name;
};
