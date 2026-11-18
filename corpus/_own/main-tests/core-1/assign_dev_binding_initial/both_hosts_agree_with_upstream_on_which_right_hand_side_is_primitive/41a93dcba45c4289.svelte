<script>
	let o = $state({});
	const g = 7;
	function f() {  o.a = o.b = g; }
</script>
<button onclick={f}>x</button>
