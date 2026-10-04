<script>
  class Counter {
    count;
    #step;
    #next;
    doubled;
    constructor(value) {
      this.count = $state(value);
      this.#step = $state(1);
      this.raw = $state.raw([]);
      this.item = $state({ value });
      this.doubled = $derived(this.count * 2);
      this.#next = $derived.by(() => this.count + this.#step);
    }
    increment() { this.count += this.#step; this.item.value++; this.raw = [...this.raw, this.count]; }
    step() { this.#step = 3; }
    get next() { return this.#next; }
  }
  let counter = $state(new Counter(2));
</script>
<button class="increment" onclick={() => counter.increment()}>increment</button>
<button class="step" onclick={() => counter.step()}>step</button>
<button class="replace" onclick={() => counter = new Counter(5)}>replace</button>
<p>{counter.count}:{counter.item.value}:{counter.raw.join(',')}:{counter.doubled}:{counter.next}:{Object.keys(counter).join(',')}</p>
