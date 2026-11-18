<script>
	let f = (s) => s;
</script>

<button on:click={() => f('a b')} on:click={() => f('a  b')}>1</button>
<button on:click={() => f("x")} on:click={() => f('x')}>2</button>
<button on:click={() => f('http://x')} on:click={() => f('http://x')}>3</button>
