<script>
	function addEventListener(type, fn) {
		return [type, fn];
	}

	function go() {
		addEventListener('x', () => {});
	}
</script>

<p>{typeof go}</p>
