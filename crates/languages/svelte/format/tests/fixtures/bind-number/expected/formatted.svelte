<script>
  let a = $state(1);
  let b = $state(2);
  let sum = $derived(a + b);
</script>

<input type="number" bind:value={a} />
<input type="range" min="0" max="10" bind:value={b} />
<p>{a} + {b} = {sum}</p>
