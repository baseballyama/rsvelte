<script>
	const m = new globalThis.Map();
	m.set('a', 1);
	const w = new window.Set();
	w.add(1);
</script>

<p>{m.size} {w.size}</p>
