<script>
  let value = $state("outer");
  const rows = [1, 2];
</script>

{#snippet shadow(value)}
  <b>{value}</b>
{/snippet}

{#each rows as value}
  {@render shadow(value)}
  {#snippet inner(value)}<i>{value}</i>{/snippet}
  {@render inner(value * 10)}
{/each}

<b>{value}</b>
