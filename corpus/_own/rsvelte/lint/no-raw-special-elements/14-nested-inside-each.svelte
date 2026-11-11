<script>
	let items = [1, 2];
</script>

{#each items as item}
	{#if item}
		<div><head><body>{item}</body></head></div>
	{/if}
{/each}
