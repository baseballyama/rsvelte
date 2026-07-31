<script>
	class Thing {}

	let { a, b = new Thing() } = $state({ a: 1 });
</script>

<p>{a}{String(b)}</p>
