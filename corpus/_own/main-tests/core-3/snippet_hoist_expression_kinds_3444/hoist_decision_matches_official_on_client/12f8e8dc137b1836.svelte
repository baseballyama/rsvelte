<script>
	let io = $state({ a: 1, s: null });
</script>
{#snippet outer()}<div onclick={() => io?.a}></div>{/snippet}
{@render outer()}
