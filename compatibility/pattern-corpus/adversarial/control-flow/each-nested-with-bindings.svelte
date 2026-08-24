<script>
  let grid = $state([{ rows: [{ cells: [{ value: "a" }] }] }]);
</script>

{#each grid as section, s (s)}
  {#each section.rows as row, r (r)}
    {#each row.cells as cell, c (c)}
      <input bind:value={cell.value} />
      <input bind:value={grid[s].rows[r].cells[c].value} />
      <b>{s}{r}{c}{cell.value}</b>
    {/each}
  {/each}
{/each}

<b>{grid[0].rows[0].cells[0].value}</b>
