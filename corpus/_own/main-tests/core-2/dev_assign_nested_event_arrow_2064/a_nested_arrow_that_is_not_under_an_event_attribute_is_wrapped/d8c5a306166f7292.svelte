<script>
	let scroll = $state({ x: 0 });
	let x = $state(1);
	function bump() { x += 1; }
	const run = (fn) => fn();
	const go = () => run(() => (scroll.x = x));
</script>

<button onclick={go}></button>
<button onclick={bump}></button>
