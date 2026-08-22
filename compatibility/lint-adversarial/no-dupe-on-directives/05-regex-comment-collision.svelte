<script>
	let s = 'a//b';
	let f = (x) => x;
	let g = (x) => x;
</script>

<button on:click={() => s.split(/\/\//).map(f)} on:click={() => s.split(/\/\//).map(g)}>1</button>
