<script>
	let a = $state(0);
	let out = $state(null);
	const src = { x: { a: 1 } };
	function go() {
		out = ({ x: { a } } = src);
	}
</script>
<button onclick={go}>{a}{out}</button>