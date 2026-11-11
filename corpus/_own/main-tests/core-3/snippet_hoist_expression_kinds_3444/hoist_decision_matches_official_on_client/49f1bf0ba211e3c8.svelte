<script>
	let io = $state({ a: 1, s: null });
</script>
{#snippet outer()}{io?.[0]}{/snippet}
{@render outer()}
