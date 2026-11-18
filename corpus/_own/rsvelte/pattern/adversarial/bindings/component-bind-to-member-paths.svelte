<script>
  import Self from "./component-bind-to-member-paths.svelte";

  let { depth = 0, value = $bindable(0) } = $props();

  let box = $state({ deep: { key: 1, list: [2] } });
  let rows = $state([{ v: 3 }]);
  let index = $state(0);
</script>

{#if depth === 0}
  <Self depth={1} bind:value={box.deep.key} />
  <Self depth={1} bind:value={box.deep.list[0]} />
  <Self depth={1} bind:value={rows[0].v} />
  <Self depth={1} bind:value={rows[index].v} />
  <Self depth={1} bind:value={box["deep"]["key"]} />
  <b>{box.deep.key}{box.deep.list[0]}{rows[0].v}</b>
{:else}
  <button onclick={() => (value += 1)}>{value}</button>
{/if}
