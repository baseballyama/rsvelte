<script>
	let o = $state({});
	let g = Math.round(1.5);
</script>
<button onclick={() => { g = 2; o.a = o.b = g; }}>x</button>
