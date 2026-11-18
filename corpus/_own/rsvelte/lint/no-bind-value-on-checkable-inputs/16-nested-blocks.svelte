<script>
  let items = [1];
  let p = Promise.resolve(1);
  let v = '';
</script>

{#each items as item (item)}
  <input type="checkbox" bind:value={v} />
{/each}
{#snippet row()}
  <input type="radio" bind:value={v} />
{/snippet}
{@render row()}
{#await p then value}
  <input type="checkbox" bind:value={v} data-v={value} />
{/await}
<svelte:boundary>
  <input type="radio" bind:value={v} />
</svelte:boundary>
