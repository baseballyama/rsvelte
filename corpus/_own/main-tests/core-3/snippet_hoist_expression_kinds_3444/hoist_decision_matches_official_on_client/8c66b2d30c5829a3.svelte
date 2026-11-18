<script module>
	const mo = { a: 1, s: null };
</script>
{#snippet outer()}{mo?.[0]}{/snippet}
{@render outer()}
