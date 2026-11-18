<script>
	let y = 1;
	let z = 2;
	function f() {}
	function sink() {}
	const fade = () => {};
</script>
{#each [(<T,>(a: T) => a)(1)] as q}<p>{q}</p>{/each}
