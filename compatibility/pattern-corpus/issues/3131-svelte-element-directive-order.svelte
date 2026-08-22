<script>
	let el = $state(null);
	let on = $state(true);

	function act(node) {
		node.dataset.a = '1';
	}
</script>

<svelte:element this={'div'} bind:this={el} class:on use:act>a</svelte:element>
<svelte:element this={'div'} use:act bind:this={el}>b</svelte:element>

<p>{el?.tagName ?? '-'} {on}</p>

<style>
	.on {
		font-weight: bold;
	}
</style>
