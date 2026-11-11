<script>
	const items = [{ id: 1 }];
	const fallback = 0;
</script>

{#each items as { id = fallback } (fallback)}
	<span>{id}</span>
{/each}
