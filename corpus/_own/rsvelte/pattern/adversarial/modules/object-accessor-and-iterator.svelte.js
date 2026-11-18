let backing = $state(0);

const key = Symbol("k");

export const box = {
  get value() {
    return backing;
  },
  set value(next) {
    backing = next;
  },
  get ["computed"]() {
    return backing + 1;
  },
  [key]: "symbol-keyed",
  *[Symbol.iterator]() {
    yield backing;
    yield backing + 1;
  },
  async *stream() {
    yield backing;
  },
  method() {
    return backing;
  },
  async asyncMethod() {
    return backing;
  },
  *generator() {
    yield backing;
  },
};

export const proxied = new Proxy(box, {
  get(target, name, receiver) {
    return Reflect.get(target, name, receiver);
  },
});

export function tour() {
  box.value = 1;
  return [box.value, box.computed, box[key], [...box], proxied.value];
}
