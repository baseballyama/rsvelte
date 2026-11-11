export class C {
  #current = $state(0);
  set(v) { this.#current = v; }
}