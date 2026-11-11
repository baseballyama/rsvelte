let top = $state(0);

export class Holder {
  field = $state(1);
  #hidden = $state(2);
  derivedField = $derived(this.field + this.#hidden);

  static shared = 0;

  static {
    Holder.shared = 1;
  }

  get view() {
    return this.field;
  }

  method(argument = $state.snapshot({ a: 1 })) {
    return argument;
  }

  ["computed"]() {
    return this.field;
  }
}

export function outer() {
  function inner() {
    return $state.snapshot({ b: top });
  }

  const arrow = () => $state.snapshot({ c: top });

  return [inner(), arrow()];
}

export const table = {
  value: $state.snapshot({ d: top }),
  method() {
    return $state.snapshot({ e: top });
  },
  get view() {
    return $state.snapshot({ f: top });
  },
};

export function bump() {
  top += 1;
  return top;
}
