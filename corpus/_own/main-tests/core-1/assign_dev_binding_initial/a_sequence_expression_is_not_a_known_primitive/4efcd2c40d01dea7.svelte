<script>
	let o = $state({});
	function f() { o.a = o.b = (1, 2); }
</script>
<button onclick={f}>x</button>
