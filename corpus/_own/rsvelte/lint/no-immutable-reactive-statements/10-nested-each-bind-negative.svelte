<script>
	let rows = [[{ v: 1 }]];
	$: count = rows.length;
</script>

{count}
{#each rows as row}
	{#each row as cell}
		<input bind:value={cell.v} />
	{/each}
{/each}
