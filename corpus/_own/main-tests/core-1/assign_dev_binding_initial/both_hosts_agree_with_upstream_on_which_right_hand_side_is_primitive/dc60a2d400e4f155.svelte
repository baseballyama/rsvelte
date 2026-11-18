<script>
	let o = $state({});
	const g = 1 ? 2 : 3;
	function f() {  o.a = o.b = g; }
</script>
<button onclick={f}>x</button>
