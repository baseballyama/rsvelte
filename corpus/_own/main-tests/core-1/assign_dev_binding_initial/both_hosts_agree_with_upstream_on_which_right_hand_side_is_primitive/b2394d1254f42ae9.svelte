<script>
	let o = $state({});
	const g = 7;
	function f() { g.x = 1; o.a = o.b = g; }
</script>
<button onclick={f}>x</button>
