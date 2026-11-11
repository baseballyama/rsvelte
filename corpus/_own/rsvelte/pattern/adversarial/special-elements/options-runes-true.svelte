<svelte:options runes={true} />

<script>
  let value = $state(0);

  const doubled = $derived(value * 2);

  function bump() {
    value += 1;
  }
</script>

<b>{value}{doubled}</b>
<button onclick={bump}>go</button>
