<script>
	let o = $state({});
	const g = 7;
</script>
<button onclick={() => { g.x = 1; o.a = o.b = g; }}>x</button>
