<script>
	let [{ a }, ] = [{ a: 1 }];
	function f() {
		a++;
	}
</script>
<button onclick={f}>{a}</button>