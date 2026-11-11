<script>
  let { fallback } = $props();

  const table = { row: null };
  let optional = $state(null);
</script>

{#snippet row(value)}
  <b>{value}</b>
{/snippet}

{@render row(1)}
{@render (optional ?? row)(2)}
{@render (true ? row : row)(3)}
{@render (table.row ?? row)(4)}
{#if fallback}
  {@render fallback()}
{/if}
