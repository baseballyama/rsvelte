<script>
	const m = new Map();
	m.set('a', 1);
	const m2 = new Map([['b', 2]]);
	const v = m2.get('b');
	const d = new Date();
	d.setHours(0);
	const d2 = new Date();
	const t = d2.getTime();
</script>

<p>{v} {t}</p>
