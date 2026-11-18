<script>
	const items = [{ id: 1 }];
	const prefix = 'p';
</script>

{#each items as item (`${prefix}-${item.id}`)}
	<b>{item.id}</b>
{/each}
