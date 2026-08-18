<script>
	let go = (s) => s;
	let x = 1;
</script>

<button on:click={() => go(`a${ x }`)} on:click={() => go(`a${x}`)}>1</button>
