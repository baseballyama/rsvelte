<script>
	let x = $state(0);
	let y = $state(0);
	const src = { a: [1, 2] };
	function go() {
		({ a: [x, y] } = src);
	}
</script>
<button onclick={go}>{x}{y}</button>