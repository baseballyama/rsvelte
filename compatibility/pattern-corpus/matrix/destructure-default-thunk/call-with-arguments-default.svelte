<script>
	function f(x) {
		return x;
	}

	let { a, b = f(1) } = $state({ a: 1 });
</script>

<p>{a}{b}</p>
