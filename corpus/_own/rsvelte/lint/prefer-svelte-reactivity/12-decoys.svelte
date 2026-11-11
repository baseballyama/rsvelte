<script>
	const fake = { set: (k, v) => [k, v] };
	fake.set('a', 1);
	const s = 'new Map().set(1, 2)';
	// new Date().setHours(1)
	const re = /new Set\(\).add/;
	const props = new Map();
	const size = props.size;
</script>

<p>{s} {re.source} {size}</p>
