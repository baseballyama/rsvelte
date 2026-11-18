<script>
  let rows = $state([{ id: 1, pair: [1, 2], meta: { tag: "a" } }]);
  const table = { a: 1, b: 2 };
</script>

{#each rows as row}
  <b>{row.id}</b>
{/each}

{#each rows as row, i}
  <b>{i}{row.id}</b>
{/each}

{#each rows as row (row.id)}
  <b>{row.id}</b>
{/each}

{#each rows as row, i (row.id)}
  <b>{i}{row.id}</b>
{/each}

{#each rows as { id, pair: [first, second], meta: { tag } }, i (id)}
  <b>{i}{id}{first}{second}{tag}</b>
{/each}

{#each Object.entries(table) as [name, value], i (name)}
  <b>{i}{name}{value}</b>
{/each}

{#each rows as row, i (i)}
  <b>{row.id}</b>
{:else}
  <b>empty</b>
{/each}

{#each [...rows].reverse() as row, index (`${row.id}-${index}`)}
  <b>{row.id}</b>
{/each}
