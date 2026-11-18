<script>
	let [, { a }, , [b]] = [0, { a: 1 }, 0, [2]];
	function f() {
		a++;
	}
</script>
<button onclick={f}>{a}{b}</button>