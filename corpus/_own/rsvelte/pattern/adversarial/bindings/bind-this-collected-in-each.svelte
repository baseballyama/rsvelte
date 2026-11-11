<script>
  let rows = $state([1, 2, 3]);
  let nodes = $state([]);
  let map = $state({});
  let last = $state(null);
</script>

{#each rows as row, i (row)}
  <div bind:this={nodes[i]}>{row}</div>
  <div bind:this={map[row]}>{row}</div>
  <div bind:this={last}>{row}</div>
{/each}

<b>{nodes.filter(Boolean).length}</b>
<b>{Object.keys(map).length}</b>
<b>{last ? 1 : 0}</b>
