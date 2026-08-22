<script>
  import Self from "./component-instance-and-key.svelte";

  let { depth = 0, seed = 0 } = $props();

  let which = $state(0);
  let instance = $state(null);
  const table = [1, 2];
</script>

{#if depth === 0}
  {#key which}
    <Self depth={1} seed={which} bind:this={instance} />
  {/key}

  {#each table as row (row)}
    {#key row}
      <Self depth={1} seed={row} />
    {/key}
  {/each}

  <button onclick={() => (which += 1)}>{which}{instance ? 1 : 0}</button>
{:else}
  <b>{seed}</b>
{/if}
