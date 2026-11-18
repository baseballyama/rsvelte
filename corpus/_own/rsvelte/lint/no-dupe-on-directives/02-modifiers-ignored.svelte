<script>
	let h = () => {};
</script>

<button on:click|once={h} on:click|capture={h}>1</button>
<button on:click|preventDefault={h} on:click={h}>2</button>
