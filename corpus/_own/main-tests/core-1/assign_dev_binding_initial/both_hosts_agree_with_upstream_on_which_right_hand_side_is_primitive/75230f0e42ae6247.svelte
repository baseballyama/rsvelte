<script>
	let o = $state({});
	let g;
	function f() {  o.a = o.b = g; }
</script>
<button onclick={f}>x</button>
