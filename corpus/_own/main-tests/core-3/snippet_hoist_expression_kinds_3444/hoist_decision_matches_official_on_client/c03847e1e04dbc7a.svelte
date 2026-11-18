<script module>
	const mo = { a: 1, s: null };
	const M = 1;
</script>
{#snippet outer()}{mo?.a ?? M}{/snippet}
{@render outer()}
