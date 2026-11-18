<script>
	let o = $state({});
	let g = $state(Math.round(1.5));
</script>
<button onclick={() => {  o.a = o.b = g; }}>x</button>
