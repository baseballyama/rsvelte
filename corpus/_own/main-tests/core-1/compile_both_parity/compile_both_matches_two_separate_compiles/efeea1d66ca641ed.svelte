<script>
  let items = $state([1, 2, 3]);
</script>
{#snippet row(x)}
  <li>{x}</li>
{/snippet}
{#if items.length}
  <ul>
    {#each items as item}
      {@render row(item)}
    {/each}
  </ul>
{:else}
  <p>empty</p>
{/if}