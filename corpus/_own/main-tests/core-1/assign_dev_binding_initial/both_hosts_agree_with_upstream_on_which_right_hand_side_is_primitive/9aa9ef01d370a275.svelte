<script>
	let o = $state({});
	let g = $state(Math.round(1.5));
	function f() {  o.a = o.b = g; }
</script>
<button onclick={f}>x</button>
