<script>
	let h = () => {};
	let a = () => {};
	let b = () => {};
</script>

<button on:click={h} on:click={h}>1</button>
<button on:click={a} on:click={b}>2</button>
<button on:click on:click>3</button>
<button on:click={h} on:keydown={h}>4</button>
