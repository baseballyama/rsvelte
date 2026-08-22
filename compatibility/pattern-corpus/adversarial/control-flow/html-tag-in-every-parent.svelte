<script>
  let raw = $state("<b>x</b>");
  let rows = $state([raw]);
</script>

{@html raw}

<div>{@html raw}</div>

{#if raw}
  {@html raw}
{/if}

{#each rows as row}
  {@html row}
{/each}

{#key raw}
  {@html raw}
{/key}

{#await Promise.resolve(raw) then value}
  {@html value}
{/await}

{#snippet body()}
  {@html raw}
{/snippet}

{@render body()}

<svelte:boundary>
  {@html raw}
</svelte:boundary>
