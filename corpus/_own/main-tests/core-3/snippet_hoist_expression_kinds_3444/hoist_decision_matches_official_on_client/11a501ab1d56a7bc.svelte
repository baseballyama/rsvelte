<script>
	let io = $state({ a: 1, s: null });
</script>
{#snippet outer()}{@render io?.s?.()}{/snippet}
{@render outer()}
