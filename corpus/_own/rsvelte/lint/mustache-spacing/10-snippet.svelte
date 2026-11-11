<script>
	let n = 1;
</script>

{#snippet one(a, b) }
	{a}{b}
{/snippet }

{#snippet two(x = '}') }
	{x}
{/snippet}

{@render one(n, n)}
{@render two()}
