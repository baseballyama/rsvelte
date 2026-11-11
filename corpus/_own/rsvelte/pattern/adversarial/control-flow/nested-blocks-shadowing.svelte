<script>
	let item = $state('outer');
	let items = $state([['a'], ['b']]);
	let promise = $state(Promise.resolve(['x']));
</script>

{#if item}
	{#each items as item, item2}
		{#each item as item, inner (inner)}
			{#await promise then item}
				<p>{item}{item2}{inner}</p>
			{/await}
		{/each}
	{/each}
{/if}
