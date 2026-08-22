<script>
	let a = 1;
	let b = 2;
	const g = (x) => x;
</script>

<button type="button" on:click={() => g(a?.5:b)} on:click={() => g(a ? .5 : b)}>x</button>
