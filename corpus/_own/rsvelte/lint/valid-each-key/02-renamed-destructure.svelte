<script>
	const items = [{ id: 1 }];
	const id = 'outer-id';
</script>

{#each items as { id: renamed } (id)}
	<span>{renamed}</span>
{/each}
