<script>
	let { a, b = 5 } = $state({});
	function f() { b = 2; }
</script>
<p>{a}{b}</p><button onclick={f}>x</button>