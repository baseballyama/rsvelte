<script module>
	const mo = { a: 1, s: null };
</script>
{#snippet outer()}<div title={mo?.a}></div>{/snippet}
{@render outer()}
