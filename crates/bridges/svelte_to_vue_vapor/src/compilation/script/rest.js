const $$rest_props = (attrs) => new Proxy(attrs, {
  get(target, key) {
    if (typeof key === 'symbol' && key.description === '@attach') return target.__rsvelte_attachments?.[key];
    return Reflect.get(target, key);
  },
  has(target, key) {
    if (typeof key === 'symbol' && key.description === '@attach') return key in (target.__rsvelte_attachments ?? {});
    return key !== '__rsvelte_attachments' && Reflect.has(target, key);
  },
  ownKeys(target) {
    return Reflect.ownKeys(target).filter((key) => key !== '__rsvelte_attachments')
      .concat(Object.getOwnPropertySymbols(target.__rsvelte_attachments ?? {}));
  },
  getOwnPropertyDescriptor(target, key) {
    if (typeof key === 'symbol' && key.description === '@attach') {
      const value = target.__rsvelte_attachments?.[key];
      if (key in (target.__rsvelte_attachments ?? {})) return { configurable: true, enumerable: true, value };
      return undefined;
    }
    if (key === '__rsvelte_attachments') return undefined;
    return Reflect.getOwnPropertyDescriptor(target, key);
  }
});
