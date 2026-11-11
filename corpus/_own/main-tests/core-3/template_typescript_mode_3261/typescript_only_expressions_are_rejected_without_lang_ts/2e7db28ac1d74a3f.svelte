<script>
	let y = 1;
	let z = 2;
	function f() {}
	function sink() {}
	const fade = () => {};
</script>
{#each [1] as q}<p>{y as const}</p>{/each}
