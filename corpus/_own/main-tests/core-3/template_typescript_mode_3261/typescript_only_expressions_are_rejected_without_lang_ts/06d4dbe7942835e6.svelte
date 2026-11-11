<script>
	let y = 1;
	let z = 2;
	function f() {}
	function sink() {}
	const fade = () => {};
</script>
<button onclick={() => sink((<T,>(a: T) => a)(1))}>x</button>
