<script>
  let n = $state(1);
</script>

<input type="number" bind:value={n} />
<p>{typeof n}: {n} + 1 = {n + 1}</p>
