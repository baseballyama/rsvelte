<script>
	let items = [];
	let empty = '<p>none</p>';
</script>

{#each items as item}
	{@html item}
{:else}
	{@html empty}
{/each}
