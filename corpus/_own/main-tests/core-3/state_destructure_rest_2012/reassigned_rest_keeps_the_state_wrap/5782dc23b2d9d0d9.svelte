<script>
	let { a, ...r } = $state({});
	function f() { r = {}; }
</script>
<p>{a}{r}</p><button onclick={f}>x</button>