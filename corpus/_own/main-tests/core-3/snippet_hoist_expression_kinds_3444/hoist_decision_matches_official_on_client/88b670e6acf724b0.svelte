<script>
	let io = $state({ a: 1, s: null });
</script>
{#snippet outer()}{#if io?.a}y{/if}{/snippet}
{@render outer()}
