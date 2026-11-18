<script>
	const obj = { m: () => 1 };

	let { a, b = obj.m() } = $state({ a: 1 });
</script>

<p>{a}{b}</p>
