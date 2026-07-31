<script>
	let { a, b = { x: 1 } } = $state({ a: 1 });
</script>

<p>{a}{JSON.stringify(b)}</p>
