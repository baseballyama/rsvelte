<script>
  let source = $state([3, 1, 2]);
  let filter = $state(0);

  const sorted = $derived([...source].sort((a, b) => a - b));
  const filtered = $derived(sorted.filter((value) => value > filter));
  const grouped = $derived.by(() =>
    filtered.map((value) => ({ id: value, half: value / 2 })),
  );
</script>

{#each sorted as value}
  <b>{value}</b>
{/each}

{#each filtered as value (value)}
  <b>{value}</b>
{/each}

{#each grouped as row (row.id)}
  <b>{row.id}:{row.half}</b>
{/each}

{#each grouped.slice(0, 2) as row, i (row.id)}
  <b>{i}{row.id}</b>
{/each}

<button onclick={() => (filter += 1)}>{filter}</button>
<button onclick={() => source.push(source.length)}>{source.length}</button>
