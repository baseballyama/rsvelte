<script>
	let o = $state({});
	let g = Math.round(1.5);
</script>
<button onclick={() => { g++; o.a = o.b = g; }}>x</button>
