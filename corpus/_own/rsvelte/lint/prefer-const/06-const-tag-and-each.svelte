<script>
	const items = [1, 2, 3];
</script>
{#each items as item, i (item)}
	{@const squared = item * item}
	<p>{i}: {squared}</p>
{/each}
