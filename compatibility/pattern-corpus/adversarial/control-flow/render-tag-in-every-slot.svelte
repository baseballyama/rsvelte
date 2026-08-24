<script>
  let rows = $state([1]);
  let flag = $state(true);
  const pending = Promise.resolve(1);
</script>

{#snippet body(value)}
  <b>{value}</b>
{/snippet}

{@render body(0)}

<div>
  text before {@render body(1)} text after
</div>

{#if flag}
  {@render body(2)}
{:else}
  {@render body(3)}
{/if}

{#each rows as row}
  {@render body(row)}
{/each}

{#key flag}
  {@render body(4)}
{/key}

{#await pending}
  {@render body(5)}
{:then value}
  {@render body(value)}
{:catch error}
  {@render body(6)}
{/await}

<svelte:boundary>
  {@render body(7)}
</svelte:boundary>

{#snippet outer()}
  {@render body(8)}
{/snippet}

{@render outer()}
