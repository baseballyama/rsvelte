<script module>
	const mo = { a: 1, s: null };
</script>
{#snippet outer()}{@const v = mo?.a}{v}{/snippet}
{@render outer()}
