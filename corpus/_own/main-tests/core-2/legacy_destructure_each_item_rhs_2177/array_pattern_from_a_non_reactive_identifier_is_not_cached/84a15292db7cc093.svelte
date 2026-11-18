<script>
	let x, y;
	function f(pair) {
		[x, y] = pair;
	}
</script>
<button onclick={() => f([1, 2])}>{x} {y}</button>