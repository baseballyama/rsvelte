<script module>
	const mo = { a: 1, s: null };
</script>
{#snippet outer()}{@html mo?.a}{/snippet}
{@render outer()}
