<script>
	let items = [];
	let fallback = 0;
</script>

{#each items as item}
	{@debug item}
{:else}
	{@debug fallback}
{/each}
