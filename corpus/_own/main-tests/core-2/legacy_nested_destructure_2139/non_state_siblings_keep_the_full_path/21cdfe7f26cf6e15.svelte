<script>
	let { a: { b, c } } = { a: { b: 1, c: 2 } };
	function f() {
		b++;
	}
</script>
<button onclick={f}>{b}{c}</button>