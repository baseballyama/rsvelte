<script>
  class Counter {
    count = $state(0);
    label = $state('counter');
    raw = $state.raw([]);
    doubled = $derived(this.count * 2);
    #step = $state(1);
    #hidden = $derived.by(() => this.count + this.#step);
    #$$v_state_0 = 17;
    constructor(count) { this.count = count; }
    get hidden() { return this.#hidden + this.#$$v_state_0; }
    increment() { this.count += this.#step; this.raw = [...this.raw, this.count]; }
    step(value) { this.#step = value; }
    reset = () => { this.count = 0; this.raw = []; };
  }
  class NamedCounter extends Counter {
    name = $state('named');
  }
  let counter = $state(new NamedCounter(2));
  let other = $state(new Counter(5));
</script>
<input type="number" bind:value={counter.count} />
<button class="increment" onclick={() => counter.increment()}>increment</button>
<button class="step" onclick={() => { counter.step(3); counter.label = 'changed'; }}>step</button>
<button class="reset" onclick={counter.reset}>reset</button>
<button class="replace" onclick={() => counter = new NamedCounter(4)}>replace</button>
<p>{counter.name}:{counter.label}:{counter.count}:{counter.doubled}:{counter.hidden}:{counter.raw.join(',')}:{Object.keys(counter).join(',')}</p>
<p>{other.count}:{other.doubled}:{other.hidden}</p>
