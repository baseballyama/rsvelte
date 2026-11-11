<script>
  let a = $state(1);
  let b = $state(2);

  const sum = $derived(a + b);
  const chained = $derived(sum * 2);
  const fromCall = $derived.by(function () {
    return chained + a;
  });
  const conditional = $derived(a > 0 ? b : sum);
  const inObject = $derived({ sum, chained });
  const inArray = $derived([sum, chained]);
  const viaHelper = $derived(pick());

  function pick() {
    return a > b ? a : b;
  }
</script>

<button onclick={() => (a += 1)}>a</button>
<b>{sum}{chained}{fromCall}</b>
<b>{conditional}{inObject.sum}{inArray[1]}{viaHelper}</b>
