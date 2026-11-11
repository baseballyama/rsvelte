export class Registry {
  static #instances = 0;
  static registry = new Map();

  static {
    Registry.registry.set("boot", 0);
  }

  #items = $state([]);
  label = $state("r");

  count = $derived(this.#items.length);

  constructor() {
    Registry.#instances += 1;
  }

  static get instances() {
    return Registry.#instances;
  }

  static create() {
    return new Registry();
  }

  get items() {
    return this.#items;
  }

  set items(next) {
    this.#items = next;
  }

  add(item) {
    this.#items = [...this.#items, item];
    return this.count;
  }
}

export const shared = Registry.create();
