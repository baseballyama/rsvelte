class Cell {
  #value = $state(0);
  #log = $state.raw([]);

  get value() {
    return this.#value;
  }

  set value(next) {
    this.#value = next;
    this.#log = [...this.#log, next];
  }

  get log() {
    return this.#log;
  }
}

class Wrapped extends Cell {
  get doubled() {
    return this.value * 2;
  }
}

export const cell = new Wrapped();
