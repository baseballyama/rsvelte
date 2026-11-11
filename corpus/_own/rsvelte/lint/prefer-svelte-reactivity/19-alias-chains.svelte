<script>
	const a = new Map();
	const b = a;
	const c = b;
	c.set(1, 2);

	let d;
	d = new Set();
	const e = d;
	e.add(1);

	const [f] = [new Date()];
	f.setHours(0);

	const { g = new URL('https://x.y') } = {};
	g.hash = '#z';
</script>

<p>{a.size}{d.size}{f}{g}</p>
