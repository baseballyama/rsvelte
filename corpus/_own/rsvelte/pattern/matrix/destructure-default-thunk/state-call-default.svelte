<script>
	function f() {
		return 1;
	}

	let { a, b = f() } = $state({ a: 1 });
</script>

<p>{a}{b}</p>
