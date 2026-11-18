<script>
	let io = $state({ a: 1, s: null });
</script>
{#snippet outer(a = io?.a)}{a}{/snippet}
{@render outer(1)}
