<script>
  let rows = $state([]);
  let on = $state(false);
</script>

{#each rows as row}
  <b>{row}</b>
{:else}
  <b>empty</b>
{/each}

{#each rows as row}{/each}

{#if on}{/if}

{#if on}

{:else}

{/if}

{#key on}{/key}

{#each rows as row, i}
  {#if i}{/if}
{:else}

{/each}

{#snippet blank()}{/snippet}
{@render blank()}
