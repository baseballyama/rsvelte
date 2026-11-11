<script module>
	const mo = { a: 1, s: null };
</script>
{#snippet outer()}{#each mo?.a ?? [] as z}{z}{/each}{/snippet}
{@render outer()}
