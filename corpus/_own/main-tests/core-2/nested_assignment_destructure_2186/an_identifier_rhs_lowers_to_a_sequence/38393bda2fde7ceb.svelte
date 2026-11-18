<script>
	let b = $state(0);
	const src = { a: { b: 1 } };
	function go() {
		({ a: { b } } = src);
	}
</script>
<button onclick={go}>{b}</button>