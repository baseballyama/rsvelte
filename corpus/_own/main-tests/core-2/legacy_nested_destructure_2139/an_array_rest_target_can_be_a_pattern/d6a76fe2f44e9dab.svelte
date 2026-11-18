<script>
	let [...[a, b]] = [1, 2];
	function f() {
		a++;
	}
</script>
<button onclick={f}>{a}{b}</button>