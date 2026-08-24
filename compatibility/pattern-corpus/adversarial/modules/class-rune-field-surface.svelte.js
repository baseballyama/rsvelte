export class Counter {
  value = $state(0);
  #hidden = $state(1);
  static total = 0;
  static #privateTotal = 0;
  frozen = $state.raw({ list: [] });

  doubled = $derived(this.value * 2);
  #derivedHidden = $derived(this.#hidden + 1);

  constructor(initial) {
    this.value = initial;
    Counter.total += 1;
    Counter.#privateTotal += 1;
  }

  get hidden() {
    return this.#hidden;
  }

  set hidden(next) {
    this.#hidden = next;
  }

  get combined() {
    return this.doubled + this.#derivedHidden;
  }

  static get privateTotal() {
    return Counter.#privateTotal;
  }

  #bump() {
    this.#hidden += 1;
  }

  bump() {
    this.value += 1;
    this.#bump();
    this.frozen = { list: [...this.frozen.list, this.value] };
    return this.combined;
  }
}

export const shared = new Counter(1);
