<script module>
	const mo = { a: 1, s: null };
</script>
{#snippet outer()}{@render mo.s()}{/snippet}
{@render outer()}
