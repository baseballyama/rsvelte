<script>
	let box;
</script>

<div bind:this={box}>a</div>
<button on:click={() => box.remove()}>x</button>
