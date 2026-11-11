<script>
	let o = $state({});
	const g = `a${1}`;
	function f() {  o.a = o.b = g; }
</script>
<button onclick={f}>x</button>
