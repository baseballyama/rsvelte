<script>
  /* eslint svelte/consistent-selector-style: ["warn", { "style": ["id", "class"] }] */
  let items = [];
</script>

{#each items as item (item)}
  <li class="item">{item}</li>
{:else}
  <div class="empty">no items</div>
{/each}

<style>
  .empty {
    color: gray;
  }
</style>
