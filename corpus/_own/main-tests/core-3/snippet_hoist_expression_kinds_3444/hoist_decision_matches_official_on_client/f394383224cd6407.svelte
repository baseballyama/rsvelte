<script>
	let io = $state({ a: 1, s: null });
</script>
{#snippet outer()}<div title={io?.a}></div>{/snippet}
{@render outer()}
