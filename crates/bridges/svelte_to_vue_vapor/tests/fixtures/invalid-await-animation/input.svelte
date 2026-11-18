<script>
  function animation() {}
  const items = [1];
</script>
{#each items as item (item)}
  <p animate:animation={await Promise.resolve({})}>animation</p>
{/each}
