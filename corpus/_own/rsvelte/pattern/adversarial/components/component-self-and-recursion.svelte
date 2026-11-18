<script>
	let { depth = 0, node = { kids: [] } } = $props();
</script>

{#if depth < 3}
	{#each node.kids as kid (kid.id)}
		<svelte:self depth={depth + 1} node={kid} />
	{/each}
{/if}

{#snippet row(item)}
	<li>{item.id}</li>
{/snippet}

<ul>
	{#each node.kids as kid (kid.id)}
		{@render row(kid)}
	{/each}
</ul>
