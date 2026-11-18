<script>
	const key = 'd';
	let { a, 'b-c': bc, 3: three, [key]: dee, e = 7, ...rest } = { a: 1 };
	function f() {
		bc++;
		rest = {};
	}
</script>
<button onclick={f}>{a} {bc} {three} {dee} {e} {JSON.stringify(rest)}</button>