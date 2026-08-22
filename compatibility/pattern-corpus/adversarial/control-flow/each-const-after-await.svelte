<script>
	const rows = [{ id: 1 }];
</script>

{#each rows as row}
	{@const id = row.id}
	{#await id}
		<p>x</p>
	{:then v}
		<p>{v}</p>
	{/await}
	{@const late = id + 1}
	<p>{late}</p>
{/each}
