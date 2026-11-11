<script>
	let x = 1;
	function f() {
		(x = 5);
	}
</script>
<button onclick={f}>{x}</button>