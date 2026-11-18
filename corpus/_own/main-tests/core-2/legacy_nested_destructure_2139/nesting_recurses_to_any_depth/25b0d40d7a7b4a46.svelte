<script>
	let { a: { b: { c } } } = { a: { b: { c: 1 } } };
	function f() {
		c++;
	}
</script>
<button onclick={f}>{c}</button>