let internal = $state(1);

export const box = {
  get value() {
    return internal;
  },
  set value(next) {
    internal = next;
  },
};

class Wrapper {
  #inner = $state(2);

  get inner() {
    return this.#inner;
  }

  set inner(next) {
    this.#inner = next;
  }

  static get zero() {
    return 0;
  }
}

export const wrapper = new Wrapper();

export function swap() {
  const previous = box.value;
  box.value = wrapper.inner;
  wrapper.inner = previous;
  return `${box.value}:${wrapper.inner}:${Wrapper.zero}`;
}
