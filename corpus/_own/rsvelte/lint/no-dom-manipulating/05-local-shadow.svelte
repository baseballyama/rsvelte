<script>
	let div;

	function detach(div) {
		div.remove();
	}

	function clear() {
		div.remove();
	}
</script>

<div bind:this={div}>a</div>
<button on:click={clear}>x</button>
<button on:click={() => detach(document.body)}>y</button>
