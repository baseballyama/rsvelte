<script>
	let b = $state(0);
	const src = {};
	function go() {
		({ a: { b } = { b: 3 } } = src);
	}
</script>
<button onclick={go}>{b}</button>