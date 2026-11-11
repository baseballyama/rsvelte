<script>
	let a = 1, b = 2, rest = {};
	const obj = { a: 1, b: 2, c: 3 };
	function f() { ({ a, b, ...rest } = obj); }
</script>
<button onclick={f}>{a} {b} {JSON.stringify(rest)}</button>