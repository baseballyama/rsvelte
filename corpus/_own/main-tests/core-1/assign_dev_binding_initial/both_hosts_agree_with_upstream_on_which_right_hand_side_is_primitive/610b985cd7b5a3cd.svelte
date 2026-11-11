<script>
	let o = $state({});
	let g = Math.round(1.5);
	function f() { g = 2; o.a = o.b = g; }
</script>
<button onclick={f}>x</button>
