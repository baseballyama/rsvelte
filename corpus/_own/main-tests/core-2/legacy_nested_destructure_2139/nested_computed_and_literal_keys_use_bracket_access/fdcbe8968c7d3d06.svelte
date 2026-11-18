<script>
	const k = 'x';
	let { a: { [k]: v, 'q-r': qr, 3: three } } = { a: {} };
	function f() {
		v++;
	}
</script>
<button onclick={f}>{v}{qr}{three}</button>