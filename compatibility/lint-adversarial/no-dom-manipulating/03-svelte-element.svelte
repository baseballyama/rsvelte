<script>
	let el;
	let tag = 'div';

	function go() {
		el.replaceChildren();
	}
</script>

<svelte:element this={tag} bind:this={el} />
<button on:click={go}>x</button>
