<script>
	let io = $state({ a: 1, s: null });
</script>
{#snippet outer()}{(0, io?.a)}{/snippet}
{@render outer()}
