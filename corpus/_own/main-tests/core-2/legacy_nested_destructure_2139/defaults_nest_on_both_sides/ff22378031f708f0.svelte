<script>
	let { a: { b = 5 } } = { a: {} };
	function f() {
		b++;
	}
</script>
<button onclick={f}>{b}</button>