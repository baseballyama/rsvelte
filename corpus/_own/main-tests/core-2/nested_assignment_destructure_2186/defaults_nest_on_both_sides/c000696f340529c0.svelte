<script>
	let b = $state(0);
	const src = { a: {} };
	function go() {
		({ a: { b = 5 } } = src);
	}
</script>
<button onclick={go}>{b}</button>