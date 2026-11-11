<script>
	let depth = $state(2);
</script>

{#snippet even(n)}
	<span>e{n}</span>
	{#if n > 0}
		{@render odd(n - 1)}
	{/if}
{/snippet}

{#snippet odd(n)}
	<span>o{n}</span>
	{#if n > 0}
		{@render even(n - 1)}
	{/if}
{/snippet}

{@render even(depth)}
