<script>
	class MyMap extends Map {}

	const a = new MyMap();
	a.set(1, 2);

	const b = structuredClone(new Map());
	b.set(1, 2);

	const c = new (class extends Set {})();
	c.add(1);

	const d = Object.assign(new Map(), {});
	d.set(1, 2);
</script>

<p>{a.size}{b.size}{c.size}{d.size}</p>
