<script>
	let { f } = $props();
</script>
{#snippet t(p, v = p(), w = f(), z = (() => 2)())}{v}{w}{z}{/snippet}
{@render t(1)}
