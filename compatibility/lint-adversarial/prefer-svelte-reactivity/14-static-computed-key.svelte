<script>
	const a = new Map();
	a['set'](1, 2);

	const b = new Map();
	b['s' + 'et'](1, 2);

	const c = new Set();
	c[`add`](1);

	const d = new URL('https://x.y');
	d['h' + 'ref'] = 'https://z.w';

	const e = new globalThis['M' + 'ap']();
	e.set(1, 2);

	const f = new globalThis['Map']();
	f.set(1, 2);
</script>

<p>{a.size}{b.size}{c.size}{d.href}{e.size}{f.size}</p>
