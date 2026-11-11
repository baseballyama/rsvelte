export class C {
  #fpsLimitOption = 0;
  #fps = $state(0);
  #fpsLimit = $derived(this.#fpsLimitOption + this.#fps);
  get v() { return this.#fpsLimit; }
}