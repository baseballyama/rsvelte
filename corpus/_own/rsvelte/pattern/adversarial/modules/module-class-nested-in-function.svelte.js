export function makeCounter(start) {
  class Counter {
    count = $state(start);
    doubled = $derived(this.count * 2);

    step() {
      this.count += 1;
    }
  }

  return new Counter();
}

export function makeAnonymous() {
  return new (class {
    flag = $state(false);
  })();
}
