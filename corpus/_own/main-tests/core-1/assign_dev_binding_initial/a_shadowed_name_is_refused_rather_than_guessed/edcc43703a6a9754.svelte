<script>
	let o = $state({});
	const g = {};
	function f() { const g = 7; o.a = o.b = g; }
</script>
<button onclick={f}>x</button>
