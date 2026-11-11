let inner = $state(1);

export const view = {
  get value() {
    return inner;
  },
  set value(next) {
    inner = next;
  },
  *items() {
    yield inner;
  },
  async load() {
    return inner;
  },
  ["computed" + "Key"]: () => inner,
};
