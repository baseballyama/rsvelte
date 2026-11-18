const $$style = (element, name, value, important) => {
  if (value == null || value === '') element.style.removeProperty(name);
  else element.style.setProperty(name, value, important ? 'important' : '');
};
const $$style_value = (value, important) => value == null ? null : value + (important ? ' !important' : '');
const $$styles = (element, value, declarations) => {
  const changed = element.$$style_base !== value;
  if (changed) {
    element.$$style_base = value;
    const style = element.ownerDocument.createElement('div').style;
    style.cssText = value == null ? '' : String(value);
    const properties = Array.from(style);
    Object.keys(declarations).forEach(name => {
      if (properties.includes(name)) style.removeProperty(name);
    });
    let css = style.cssText;
    Object.entries(declarations).forEach(([name, [value, important]]) => {
      if (value != null && value !== '') css += name + ':' + value + (important ? ' !important;' : ';');
    });
    if (css) element.style.cssText = css;
    else element.removeAttribute('style');
  }
  const previous = element.$$style_declarations;
  Object.keys(declarations).forEach((name) => {
    const [value, important] = declarations[name];
    if (!changed && (!previous || previous[name][0] !== value || previous[name][1] !== important)) {
      $$style(element, name, value, important);
    }
  });
  element.$$style_declarations = declarations;
};

const $$style_spread = (element, attributes, declarations) => {
  if (element) {
    const base = attributes.style;
    delete attributes.style;
    $$attributes(element, attributes);
    $$styles(element, base, declarations);
  } else {
    const style = $$v_normalizeStyle([attributes.style]) || {};
    Object.entries(declarations).forEach(([name, [value, important]]) => {
      if (value == null || value === '') delete style[name];
      else style[name] = $$style_value(value, important);
    });
    attributes.style = Object.entries(style).map(([name, value]) => name + ':' + value).join(';');
  }
  return attributes;
};
