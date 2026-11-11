<script>
	let io = $state({ a: 1, s: null });
</script>
{#snippet outer()}{#each io?.a ?? [] as z}{z}{/each}{/snippet}
{@render outer()}
