<script>
	let { a: { b } = { b: 3 } } = {};
	function f() {
		b++;
	}
</script>
<button onclick={f}>{b}</button>