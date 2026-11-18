export class C {
  #rect = $state({ x: 0, y: 0 });
  constructor() {
    this.#rect = {
      x: 1,
      y: 2,
    };
  }
}