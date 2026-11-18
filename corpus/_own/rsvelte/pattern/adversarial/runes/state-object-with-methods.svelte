<script>
  class Counter {
    value = $state(0);

    get doubled() {
      return this.value * 2;
    }

    bump() {
      this.value += 1;
      return this.value;
    }
  }

  const counter = new Counter();

  let plain = $state({
    n: 0,
    get double() {
      return this.n * 2;
    },
    bump() {
      this.n += 1;
      return this.n;
    },
  });

  const fromGetter = $derived(plain.double + counter.doubled);
</script>

<b>{counter.value}{counter.doubled}</b>
<b>{plain.n}{plain.double}</b>
<b>{fromGetter}</b>
<button onclick={() => counter.bump()}>a</button>
<button onclick={() => plain.bump()}>b</button>
