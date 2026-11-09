<script>
	const s = new globalThis.Set();
	s.add(1);
	const g = global;
	const t = new g.Set();
	t.add(1);
</script>
{s}{t}