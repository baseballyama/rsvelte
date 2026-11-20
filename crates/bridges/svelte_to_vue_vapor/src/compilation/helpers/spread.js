// `attributes` with `attr` for an HTML element that is not an `<input>` or `<textarea>`, as Vue
// props: a `^` key is printed as an attribute under its own name whatever Vue reserves it for,
// `true` as a present boolean attribute. The HTML parser keeps the first of two attributes of one
// name. Vue prints `itemscope` and `scoped` as boolean attributes, which Svelte does not.
// `events`: the load and error events Svelte's server marks on an element that fires them.
const $$invalid_name = (name) => name === '' || Array.from(name).some((ch) => {
  const c = ch.codePointAt(0);
  return ch.trim() === '' || ["'", '"', '>', '/', '='].includes(ch)
    || (c >= 64976 && c <= 65007) || (c & 65534) === 65534;
});
const $$spread_key = (out, key, value, preserve, html) => {
  if (typeof value === 'function') return;
  if (key[0] === '$' && key[1] === '$') return;
  if ($$invalid_name(key)) return;
  const lower = key.toLowerCase();
  const name = preserve ? key : lower;
  if (lower.length > 2 && lower.startsWith('on')) return;
  const boolean = html && ((name === 'hidden' && value !== 'until-found')
    || $$booleans.includes(name));
  if (value == null || (boolean && !value && value !== '')) return;
  if ('^' + name in out) return;
  if (boolean) {
    out['^' + name] = true;
    return;
  }
  const replaced = name === 'translate'
    && (value === true ? 'yes' : value === false ? 'no' : '');
  const text = String(replaced || value);
  if ((name === 'itemscope' || name === 'scoped') && text !== '') {
    $$fail('Vue renders `' + name + '` as a boolean attribute');
  }
  out['^' + name] = text;
};
const $$spread = (attrs, events, preserve = false, html = true) => {
  if (attrs.class) attrs.class = $$sclsx(attrs.class);
  const out = {};
  Object.keys(attrs).forEach((key) => $$spread_key(out, key, attrs[key], preserve, html));
  if (events) events.forEach((e) => { out['^' + e] = 'this.__e=event'; });
  return out;
};
