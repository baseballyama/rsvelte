class Vault {
  #value = $state(0);
  static #instances = 0;

  constructor() {
    Vault.#instances += 1;
  }

  #compute() {
    return this.#value * 2;
  }

  get #hidden() {
    return this.#compute();
  }

  set #hidden(next) {
    this.#value = next;
  }

  read() {
    this.#hidden = this.#value + 1;
    return `${this.#value}:${this.#hidden}:${Vault.count}`;
  }

  static get count() {
    return Vault.#instances;
  }
}

export const vault = new Vault();
