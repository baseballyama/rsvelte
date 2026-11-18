<script>
	let a = $state(0);
	let b = $state(0);
	let c = $state(0);
	const src = { x: [1, [2, 3]] };
	function go() {
		({ x: [a, [b, c]] } = src);
	}
</script>
<button onclick={go}>{a}{b}{c}</button>