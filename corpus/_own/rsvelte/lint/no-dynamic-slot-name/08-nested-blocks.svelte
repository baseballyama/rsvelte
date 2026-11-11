<script>
	let items = [1];
	let d = 'x';
</script>

{#each items as item}
	{#if item}
		<slot name={d} />
	{/if}
{/each}
