<script>
  import Self from "./component-bind-inside-keyed-each.svelte";

  let { depth = 0, value = $bindable(0) } = $props();

  let rows = $state([
    { id: 1, n: 1 },
    { id: 2, n: 2 },
  ]);
</script>

{#if depth === 0}
  {#each rows as row, i (row.id)}
    <Self depth={1} bind:value={row.n} />
    <Self depth={1} bind:value={rows[i].n} />
  {/each}
  <b>{rows.map((row) => row.n).join(",")}</b>
{:else}
  <button onclick={() => (value += 1)}>{value}</button>
{/if}
