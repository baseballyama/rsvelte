<script>
	let el;

	function go() {
		el?.remove();
		el?.normalize?.();
		const txt = el?.textContent;
		return txt;
	}
</script>

<div bind:this={el}>a</div>
<button on:click={go}>x</button>
