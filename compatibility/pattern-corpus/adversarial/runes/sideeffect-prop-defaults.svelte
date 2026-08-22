<script>
	let calls = 0;
	let {
		a = (calls += 1),
		b = a > 0 ? 'pos' : 'non',
		c = [a, b].join('-'),
	} = $props();
</script>

<p>{a} {b} {c} {calls}</p>
