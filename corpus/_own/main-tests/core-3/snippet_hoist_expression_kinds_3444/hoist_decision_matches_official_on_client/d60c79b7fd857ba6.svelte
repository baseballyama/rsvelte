<script module>
	const mo = { a: 1, s: null };
</script>
{#snippet outer()}<div onclick={() => mo?.a}></div>{/snippet}
{@render outer()}
