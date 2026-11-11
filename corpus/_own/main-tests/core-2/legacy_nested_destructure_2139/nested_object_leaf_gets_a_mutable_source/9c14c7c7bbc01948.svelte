<script>
	let { a: { b } } = { a: { b: 1 } };
	function f() {
		b++;
	}
</script>
<button onclick={f}>{b}</button>