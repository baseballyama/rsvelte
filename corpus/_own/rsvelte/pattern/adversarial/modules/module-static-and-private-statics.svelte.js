class Registry {
  static #instances = 0;
  static registry = new Map();

  static {
    Registry.registry.set("boot", true);
  }

  id = $state(0);

  constructor() {
    Registry.#instances += 1;
    this.id = Registry.#instances;
  }

  static get count() {
    return Registry.#instances;
  }

  static describe(other) {
    return `${Registry.#instances}:${other === Registry}`;
  }
}

export const first = new Registry();
export const second = new Registry();
