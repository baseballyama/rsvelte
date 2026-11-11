<script>
	const items = [{ id: 1 }];
	const outer = 'k';
</script>

{#each items as item (item.id)}
	<span>{item.id}</span>
{/each}
{#each items as item (outer)}
	<span>{outer}{item.id}</span>
{/each}
