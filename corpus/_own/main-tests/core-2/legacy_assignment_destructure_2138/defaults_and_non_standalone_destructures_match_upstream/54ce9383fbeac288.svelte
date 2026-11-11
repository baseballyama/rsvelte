<script>
	let a = 1, rest = {};
	const obj = { a: 1, c: 2 };
	let out = null;
	function f() { out = ({ a, ...rest } = obj); }
</script>
<button onclick={f}>{a} {JSON.stringify(rest)} {JSON.stringify(out)}</button>