<script>
	let items = $state([{ id: 1 }, { id: 2 }]);
	const label = 'outer';
</script>

{#snippet outer(label)}
	{#snippet inner(label)}
		<i>{label}</i>
	{/snippet}
	{@render inner(label + '!')}
	{@render inner(label)}
{/snippet}

{#each items as item (item.id)}
	{#snippet perItem()}
		<span>{item.id}:{label}</span>
	{/snippet}
	{@render perItem()}
	{@render outer(String(item.id))}
{/each}

{@render outer(label)}
