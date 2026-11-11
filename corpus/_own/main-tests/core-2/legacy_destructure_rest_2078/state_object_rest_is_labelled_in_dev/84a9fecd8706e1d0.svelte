<script>
	let { a, b, ...rest } = { a: 1, b: 2, c: 3 };
	function f() {
		a++;
		rest = { ...rest, z: 1 };
	}
</script>
<button onclick={f}>{a} {b} {JSON.stringify(rest)}</button>