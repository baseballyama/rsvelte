<script>
	let a = 1, rest = {};
	function get() { return { a: 1, c: 3 }; }
	function f() { ({ a, ...rest } = get()); }
</script>
<button onclick={f}>{a} {JSON.stringify(rest)}</button>