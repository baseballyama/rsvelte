let base = $state(1);

class Holder {
  #raw = $state(2);
  doubled = $derived(this.#raw * 2);
  fromOuter = $derived(base + this.#raw);
  byFn = $derived.by(() => this.doubled + this.fromOuter);

  bump() {
    this.#raw += 1;
  }
}

export const holder = new Holder();

export const view = {
  get doubled() {
    return holder.doubled;
  },
  get all() {
    return [holder.doubled, holder.fromOuter, holder.byFn];
  },
};

export function bumpBase() {
  base += 1;
}
