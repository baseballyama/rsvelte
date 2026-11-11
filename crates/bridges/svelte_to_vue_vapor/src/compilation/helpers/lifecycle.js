const $$lifecycle_owner = () => new WeakMap();
const $$lifecycles = $$lifecycle_owner();
const $$lifecycle_once = (element, key, lifecycles = $$lifecycles) => {
  let keys = lifecycles.get(element);
  if (!keys) {
    keys = new Set();
    lifecycles.set(element, keys);
  }
  if (keys.has(key)) return false;
  keys.add(key);
  $$onScopeDispose(() => {
    keys.delete(key);
    if (!keys.size) lifecycles.delete(element);
  });
  return true;
};
const $$attachment_scope = (element, getter) => {
  const scope = $$effectScope(true);
  scope.run(() => $$watchPostEffect((register) => $$tracked(() => {
    const attachment = getter();
    if (!attachment) return;
    const child = $$effectScope();
    register(() => child.stop());
    child.run(() => {
      const cleanup = attachment(element);
      if (typeof cleanup === 'function') $$onScopeDispose(cleanup);
    });
  })));
  return scope;
};
const $$attachment = (element, key, getter) => {
  if (!$$lifecycle_once(element, key)) return;
  const scope = $$attachment_scope(element, getter);
  $$onScopeDispose(() => scope.stop());
};
const $$spread_attachments = (element, next) => {
  let scopes = element.$$attachments;
  if (!scopes) {
    scopes = new Map();
    element.$$attachments = scopes;
    $$onScopeDispose(() => {
      scopes.forEach((entry) => entry.scope.stop());
      scopes.clear();
      delete element.$$attachments;
    });
  }
  scopes.forEach((entry, key) => {
    if (entry.value !== next[key]) {
      entry.scope.stop();
      scopes.delete(key);
    }
  });
  Object.getOwnPropertySymbols(next).forEach((key) => {
    const value = next[key];
    if (key.description === '@attach' && value && !scopes.has(key)) {
      scopes.set(key, { value, scope: $$attachment_scope(element, () => value) });
    }
  });
};
const $$action = (element, key, action, parameter) => {
  if (!$$lifecycle_once(element, key)) return;
  $$watchPostEffect((register) => {
    let result;
    let mounted = false;
    const stop = $$watch(parameter, (value) => {
      if (!mounted) {
        mounted = true;
        result = action(element, value);
      } else if (result && typeof result.update === 'function') {
        result.update(value);
      }
    }, { immediate: true, deep: true, flush: 'post' });
    register(() => {
      stop();
      if (result && typeof result.destroy === 'function') result.destroy();
    });
  });
};
const $$global_binding = (element, name, setter, owner) => {
  if (!$$lifecycle_once(element, name, owner)) return;
  const events = name === 'online' ? ['online', 'offline']
    : name === 'visibilityState' ? ['visibilitychange']
    : name === 'activeElement' ? ['focusin', 'focusout']
    : name === 'fullscreenElement' ? ['fullscreenchange']
    : name === 'scrollX' || name === 'scrollY' ? ['scroll'] : ['resize'];
  const update = () => setter(name === 'online' ? navigator.onLine : element[name]);
  update();
  events.forEach((event) => element.addEventListener(event, update));
  $$onScopeDispose(() => events.forEach((event) => element.removeEventListener(event, update)));
};
const $$event = (element, name, getter) => {
  if (!$$lifecycle_once(element, 'on' + name)) return;
  const capture = name.endsWith('capture') && name !== 'gotpointercapture' && name !== 'lostpointercapture';
  if (capture) name = name.slice(0, -7);
  const options = { capture, passive: name === 'touchstart' || name === 'touchmove' };
  const listener = (event) => {
    const handler = getter();
    if (handler != null && (!element.disabled || event.target === element)) handler.call(element, event);
  };
  element.addEventListener(name, listener, options);
  $$onScopeDispose(() => element.removeEventListener(name, listener, options));
};
