<script>
  let k = 1;
  let items = [];
</script>

{#key k}
  <style>.k { color: red; }</style>
{/key}
{#each items as item}
  <span>{item}</span>
{:else}
  <style>.e { color: red; }</style>
{/each}
