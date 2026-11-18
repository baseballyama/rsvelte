<script module>
	function tag() { return 1; }
</script>
{#snippet outer()}{tag`x`}{/snippet}
{@render outer()}
