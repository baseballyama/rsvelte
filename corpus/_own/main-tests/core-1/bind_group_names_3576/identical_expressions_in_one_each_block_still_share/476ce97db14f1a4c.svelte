<script>
	let rows = $state([{ picked: [], other: [] }]);
	let top = $state([]);
	let top2 = $state([]);
</script>

{#each rows as row, i}
	<input type="checkbox" value={i} bind:group={rows[i].picked} />
	<input type="checkbox" value={i} bind:group={rows[i].picked} />
{/each}
