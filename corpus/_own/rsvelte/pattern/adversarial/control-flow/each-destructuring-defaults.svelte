<script>
  let rows = $state([
    { id: 1, nested: {} },
    { id: 2, label: "b", nested: { deep: 3 } },
  ]);
  const pairs = [[1], [2, 3]];
</script>

{#each rows as { id, label = "d", nested: { deep = 0 } } (id)}
  <b>{id}{label}{deep}</b>
{/each}

{#each pairs as [first, second = 10], i (i)}
  <b>{first}{second}</b>
{/each}

{#each rows as { id, ...rest } (id)}
  <b>{id}{Object.keys(rest).length}</b>
{/each}

{#each pairs as [, tail = 0], i (i)}
  <b>{tail}</b>
{/each}

{#each rows as row, index (row.id)}
  {@const { id, label = `x${index}`, nested: { deep = index + 1 } = {} } = row}
  <b>{index}{id}{label}{deep}</b>
{/each}

{#snippet take({ id, label = `s${id}`, nested: { deep = id + 1 } = {} })}
  <b>{id}{label}{deep}</b>
{/snippet}

{@render take(rows[0])}
