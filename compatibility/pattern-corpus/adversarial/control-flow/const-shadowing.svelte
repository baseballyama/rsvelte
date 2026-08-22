<script>
	const value = 'outer';
	let rows = $state([{ id: 1, value: 'row' }]);
</script>

{#each rows as row (row.id)}
	{@const value = row.value}
	<p>{value}</p>
	{#if row.id}
		{@const value = 'if'}
		<i>{value}</i>
	{/if}
	{#await Promise.resolve(row.id) then value}
		<u>{value}</u>
	{/await}
{/each}
<span>{value}</span>
