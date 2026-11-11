<script module>
	function g() {
		return 1;
	}
</script>
{#snippet t(p, v = p(), w = g(), z = g(1))}{v}{w}{z}{/snippet}
{@render t(() => 1)}
