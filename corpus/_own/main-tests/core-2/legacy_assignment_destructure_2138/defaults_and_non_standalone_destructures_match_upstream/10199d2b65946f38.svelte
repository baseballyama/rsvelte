<script>
	let a = 1, rest = {};
	const obj = { c: 2 };
	function f() { ({ a = 5, ...rest } = obj); }
</script>
<button onclick={f}>{a} {JSON.stringify(rest)}</button>