class Registry {
  static label = "registry";
  static #hidden = 0;

  #count = $state(0);

  static {
    Registry.#hidden = 1;
  }

  static get hidden() {
    return Registry.#hidden;
  }

  get count() {
    return this.#count;
  }

  bump() {
    this.#count += 1;
  }
}

export const registry = new Registry();

export function read() {
  registry.bump();
  return `${Registry.label}:${Registry.hidden}:${registry.count}`;
}
