<script>
	let a = $state(0);
	let b = $state(0);
	const src = [0, { a: 1 }, 0, [2]];
	function go() {
		[, { a }, , [b]] = src;
	}
</script>
<button onclick={go}>{a}{b}</button>