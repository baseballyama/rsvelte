<script>
	let n = $state(1);
	let dyn = $state(null);
</script>

{#snippet noParams()}
	<i>none</i>
{/snippet}

{#snippet withDefaults(a = 1, { b = 2 } = {}, extras = [])}
	<b>{a}{b}{extras.length}</b>
{/snippet}

{#snippet outer(depth)}
	{#snippet inner(x)}
		<u>{x}{depth}</u>
	{/snippet}
	{@render inner(depth + 1)}
	{#if depth < 2}
		{@render outer(depth + 1)}
	{/if}
{/snippet}

{@render noParams()}
{@render withDefaults()}
{@render withDefaults(n, { b: n }, [n, n])}
{@render outer(0)}
{@render (dyn ?? noParams)()}
{@render (n > 0 ? noParams : noParams)()}

<button onclick={() => n++}>{n}</button>
