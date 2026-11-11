<script>
	let io = $state({ a: 1, s: null });
</script>
{#snippet outer()}{@html io?.a}{/snippet}
{@render outer()}
