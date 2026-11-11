<script module>
	const mo = { a: 1, s: null };
</script>
{#snippet outer(a = mo?.a)}{a}{/snippet}
{@render outer(1)}
