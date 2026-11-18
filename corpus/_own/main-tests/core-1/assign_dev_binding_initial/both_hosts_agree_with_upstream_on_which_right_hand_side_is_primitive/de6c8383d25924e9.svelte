<script>
	let o = $state({});
	const g = Math.round(1.5);
	function f() {  o.a = o.b = g; }
</script>
<button onclick={f}>x</button>
