<script>
	let a = 1;
</script>

{#snippet row(x)}
	{@debug a}
	<span>{x}</span>
{/snippet}
{@render row(a)}
