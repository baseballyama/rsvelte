<script>
	let { items = [] } = $props();
</script>

{#each items as item (item)}
	{@const label = `#${item}`}
	<span>{label}</span>
{/each}
