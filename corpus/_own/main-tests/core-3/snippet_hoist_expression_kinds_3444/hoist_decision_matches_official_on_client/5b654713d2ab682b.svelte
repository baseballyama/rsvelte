<script>
	let n = $state(1);
</script>
{#snippet outer()}{@render n?.()}{/snippet}
{@render outer()}
