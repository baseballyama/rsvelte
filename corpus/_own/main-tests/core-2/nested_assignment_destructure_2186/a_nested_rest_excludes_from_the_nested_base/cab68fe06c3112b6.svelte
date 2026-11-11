<script>
	let b = $state(0);
	let r = $state({});
	const src = { a: { b: 1, c: 2 } };
	function go() {
		({ a: { b, ...r } } = src);
	}
</script>
<button onclick={go}>{b}{JSON.stringify(r)}</button>