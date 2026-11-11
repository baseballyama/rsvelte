<script>
	let list = $state([{ id: 1, data: [{ data: [] }] }]);
</script>
{#each list as { id, data }}
	{#each data as item}
		<input type="checkbox" bind:group={item.data} value={id} />
	{/each}
	{@const picks = data[0]}
	<input type="checkbox" bind:group={picks.data} value={id} />
{/each}
