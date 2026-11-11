<script>
	const items = [1, 2, 3];
</script>

{#each items as item (item)}
	<span>{item}</span>
{/each}
{#each items as item}
	<span>{item}</span>
{/each}
