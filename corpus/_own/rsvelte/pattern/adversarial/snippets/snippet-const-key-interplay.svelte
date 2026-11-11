<script>
	let n = $state(1);
	const rows = [{ id: 1 }, { id: 2 }];
</script>

{#snippet outer(row)}
	{@const doubled = row.id * 2}
	{#key doubled}
		{@const label = `#${doubled}`}
		{#snippet inner(prefix)}
			{@const full = prefix + label}
			<b>{full}</b>
		{/snippet}
		{@render inner('row ')}
	{/key}
{/snippet}

{#each rows as row (row.id)}
	{@const shifted = { id: row.id + n }}
	{@render outer(shifted)}
{/each}

{#key n}
	{@render outer({ id: n })}
{/key}
