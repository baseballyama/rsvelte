// `set_attributes` on an HTML element that is not an `<input>`, `<textarea>`, `<select>` or
// `<option>` (the translation refuses a spread there), without a CSS hash or directives. A
// delegated handler is called from a listener on the element, as the translation maps an event
// attribute to `@event`; an attachment, which Svelte runs as an effect, throws.
const $$setters_cache = new Map();
const $$collect_setters = (proto, setters) => {
  if (proto === Element.prototype) return setters;
  const descriptors = Object.getOwnPropertyDescriptors(proto);
  Object.keys(descriptors).forEach((key) => {
    if (descriptors[key].set && key !== 'innerHTML' && key !== 'textContent'
      && key !== 'innerText') setters.add(key);
  });
  return $$collect_setters(Object.getPrototypeOf(proto), setters);
};
const $$setters = (el) => {
  const id = el.getAttribute('is') || el.nodeName;
  let setters = $$setters_cache.get(id);
  if (setters) return setters;
  $$setters_cache.set(id, (setters = new Set()));
  return $$collect_setters(el, setters);
};
const $$uninitialized = Symbol();
const $$set_attribute = (el, name, value) => {
  const cache = el.$$attributes;
  if (cache[name] === (cache[name] = value)) return;
  if (value == null) el.removeAttribute(name);
  else if (typeof value !== 'string' && $$setters(el).has(name)) el[name] = value;
  else el.setAttribute(name, value);
};
const $$aliases = { formnovalidate: 'formNoValidate', ismap: 'isMap', nomodule: 'noModule',
  playsinline: 'playsInline', readonly: 'readOnly', defaultvalue: 'defaultValue',
  defaultchecked: 'defaultChecked', srcobject: 'srcObject', novalidate: 'noValidate',
  allowfullscreen: 'allowFullscreen', disablepictureinpicture: 'disablePictureInPicture',
  disableremoteplayback: 'disableRemotePlayback' };
const $$delegated = ['beforeinput', 'click', 'change', 'dblclick', 'contextmenu', 'focusin',
  'focusout', 'input', 'keydown', 'keyup', 'mousedown', 'mousemove', 'mouseout',
  'mouseover',
  'mouseup', 'pointerdown', 'pointermove', 'pointerout', 'pointerover', 'pointerup',
  'touchend', 'touchmove', 'touchstart'];
const $$set_event = (el, current, key, value, prev_value) => {
  let name = key.slice(2);
  const delegated = $$delegated.includes(name);
  const capture = name.endsWith('capture') && name !== 'gotpointercapture'
    && name !== 'lostpointercapture';
  if (capture) name = name.slice(0, -7);
  const opts = capture ? { capture: true } : {};
  if (!delegated && prev_value) {
    if (value != null) return;
    el.removeEventListener(name, current['$$' + key], opts);
    current['$$' + key] = null;
  }
  if (delegated) {
    el['__' + name] = value;
    if (el['$$delegate_' + name]) return;
    el['$$delegate_' + name] = true;
    el.addEventListener(name, (evt) => {
      const handler = el['__' + name];
      if (handler != null && (!el.disabled || evt.target === el)) {
        if (Array.isArray(handler)) handler[0].apply(el, [evt, ...handler.slice(1)]);
        else handler.call(el, evt);
      }
    }, { passive: name === 'touchstart' || name === 'touchmove' });
  } else if (value != null) {
    const handle = function (evt) {
      if (!evt.cancelBubble) current[key].call(this, evt);
    };
    current['$$' + key] = handle;
    if (name.startsWith('pointer') || name.startsWith('touch') || name === 'wheel') {
      queueMicrotask(() => el.addEventListener(name, handle, opts));
    } else {
      el.addEventListener(name, handle, opts);
    }
  }
};
const $$set_key = (el, cache, prev, current, setters, key, value) => {
  const custom = el.nodeName.includes('-');
  if (key === 'class') {
    if (el.$$class !== value || el.$$class === undefined) {
      const name = $$to_class(value);
      if (name == null) el.removeAttribute('class');
      else el.setAttribute('class', name);
      el.$$class = value;
    }
    current[key] = value;
    return;
  }
  if (key === 'style') {
    if (el.$$style !== value) {
      if (value == null) el.removeAttribute('style');
      else el.style.cssText = String(value);
      el.$$style = value;
    }
    current[key] = value;
    return;
  }
  const prev_value = current[key];
  if (value === prev_value && !(value === undefined && el.hasAttribute(key))) return;
  current[key] = value;
  const prefix = key[0] + key[1];
  if (prefix === '$$') return;
  if (prefix === 'on') {
    $$set_event(el, current, key, value, prev_value);
  } else if (key === 'autofocus') {
    if (value) {
      const body = document.body;
      el.autofocus = true;
      queueMicrotask(() => {
        if (document.activeElement === body) el.focus();
      });
    }
  } else if (!custom && (key === '__value' || (key === 'value' && value != null))) {
    el.value = el.__value = value;
  } else {
    const lower = key.toLowerCase();
    const name = el.namespaceURI === 'http://www.w3.org/1999/xhtml'
      ? ($$aliases[lower] ?? lower)
      : key;
    const is_default = name === 'defaultValue' || name === 'defaultChecked';
    if (value == null && !custom && !is_default) {
      cache[key] = null;
      if (name === 'value') {
        const previous = el.defaultValue;
        el.removeAttribute(name);
        el.defaultValue = previous;
        el.value = el.__value = prev === undefined ? previous : null;
      } else if (name === 'checked') {
        const previous = el.defaultChecked;
        el.removeAttribute(name);
        el.defaultChecked = previous;
        el.checked = prev === undefined ? previous : false;
      } else {
        el.removeAttribute(key);
      }
    } else if (is_default || ((custom || typeof value !== 'string') && setters.has(name))) {
      el[name] = value;
      if (name in cache) cache[name] = $$uninitialized;
    } else if (typeof value !== 'function') {
      $$set_attribute(el, name, value);
    }
  }
};
const $$attributes = (el, next) => {
  el.$$attributes ??= {};
  const prev = el.$$prev;
  const current = prev || {};
  if (prev) {
    Object.keys(prev).forEach((key) => {
      if (!(key in next) && key[0] + key[1] !== '$$') next[key] = null;
    });
  }
  if (next.class) next.class = $$sclsx(next.class);
  const setters = $$setters(el);
  Object.keys(next).forEach((key) =>
    $$set_key(el, el.$$attributes, prev, current, setters, key, next[key]));
  $$spread_attachments(el, next);
  el.$$prev = current;
};
