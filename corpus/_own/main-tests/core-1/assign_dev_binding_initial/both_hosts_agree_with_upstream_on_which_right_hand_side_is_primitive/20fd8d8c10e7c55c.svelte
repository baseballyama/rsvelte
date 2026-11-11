<script>
	let o = $state({});
	const g = () => 1;
</script>
<button onclick={() => {  o.a = o.b = g; }}>x</button>
