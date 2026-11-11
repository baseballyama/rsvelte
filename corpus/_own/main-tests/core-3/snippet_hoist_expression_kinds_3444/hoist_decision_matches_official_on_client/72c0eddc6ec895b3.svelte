<script>
	let n = $state(1);
</script>
{#snippet outer()}{new (class { m() { return n; } })().m()}{/snippet}
{@render outer()}
