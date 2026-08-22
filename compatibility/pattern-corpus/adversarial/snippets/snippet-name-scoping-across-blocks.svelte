<script>
  let rows = $state([1, 2]);
  let flag = $state(true);
</script>

{#if flag}
  {#snippet body(value)}
    <b>if:{value}</b>
  {/snippet}

  {@render body(1)}
{:else}
  {#snippet body(value)}
    <b>else:{value}</b>
  {/snippet}

  {@render body(2)}
{/if}

{#each rows as row (row)}
  {#snippet body(value)}
    <b>each:{row}:{value}</b>
  {/snippet}

  {@render body(row)}
{/each}

{#key flag}
  {#snippet body(value)}
    <b>key:{value}</b>
  {/snippet}

  {@render body(3)}
{/key}

{#snippet body(value)}
  <b>top:{value}</b>
{/snippet}

{@render body(4)}
