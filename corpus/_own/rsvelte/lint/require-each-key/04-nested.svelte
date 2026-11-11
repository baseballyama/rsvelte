<script>
	const rows = [[1], [2]];
</script>

{#each rows as row (row)}
	{#each row as cell}
		<b>{cell}</b>
	{/each}
{/each}
{#each rows as row}
	{#each row as cell (cell)}
		<b>{cell}</b>
	{/each}
{/each}
