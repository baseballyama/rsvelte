<script>
	const key = 'd';
	let a = 1, bc = 0, three = 0, dee = 0, rest = {};
	const obj = { a: 1 };
	function f() { ({ a, 'b-c': bc, 3: three, [key]: dee, ...rest } = obj); }
</script>
<button onclick={f}>{a} {bc} {three} {dee} {JSON.stringify(rest)}</button>