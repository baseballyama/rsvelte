<script module>
	const M = 1;
</script>
{#snippet outer()}{#snippet s(a)}{a}{/snippet}{@render s?.(M)}{/snippet}
{@render outer()}
