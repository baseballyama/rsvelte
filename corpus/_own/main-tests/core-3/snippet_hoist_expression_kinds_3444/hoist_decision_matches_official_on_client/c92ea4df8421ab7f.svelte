<script module>
	const mo = { a: 1, s: null };
</script>
{#snippet outer()}{(0, mo?.a)}{/snippet}
{@render outer()}
