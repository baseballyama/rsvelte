<script>
	let io = $state({ a: 1, s: null });
</script>
{#snippet outer()}{io?.a ?? 1}{/snippet}
{@render outer()}
