<script>
	let [a, b, ...rest] = [1, 2, 3];
	function f() {
		a++;
	}
</script>
<button onclick={f}>{a} {b} {JSON.stringify(rest)}</button>