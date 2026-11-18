<script>
	function f() {
		if (1) {
			/* deep */
			return 2;
		}
		return 1;
	}
	let b = f();
</script>
{b}