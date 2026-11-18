<script>
	let { a, ...rest } = { a: 1, c: 3 };
	function f() {
		a++;
	}
</script>
<button onclick={f}>{a} {JSON.stringify(rest)}</button>