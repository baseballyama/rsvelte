<script>
	let { a: { b, ...r } } = { a: { b: 1, c: 2 } };
	function f() {
		b++;
	}
</script>
<button onclick={f}>{b}{JSON.stringify(r)}</button>