<script>
	let io = $state({ a: 1, s: null });
</script>
{#snippet outer()}{@const v = io?.a}{v}{/snippet}
{@render outer()}
