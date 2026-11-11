<script module>
	const M = 1;
</script>
{#snippet outer()}{new (class { m() { return M; } })().m()}{/snippet}
{@render outer()}
