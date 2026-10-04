<script>
  let { items } = $props();
</script>

{#each items}
  <hr />
{/each}

{#each items, i}
  <p>{i}</p>
{/each}

{#each items as item}
  <p>{item}</p>
{/each}

{#each items as item, i}
  <p>{i}: {item}</p>
{/each}

{#each items}
  <hr />
{:else}
  <p>None.</p>
{/each}
