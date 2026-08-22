<script>
	const a = new Map().set('a', 1);
	const b = new Set([1]).has(1);
	const c = new Date().setFullYear(2030);
	const s = new Set();
	s.add(1);
</script>

<p>{b} {c} {String(a)} {s.size}</p>
