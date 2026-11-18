<script>
	let a = 1;
	function bump() {
		a += 1;
	}
	let total = 0;
	$: {
		const add = (a) => a + 1;
		total = add(a);
	}
</script>

<button on:click={bump}>{total}</button>
