<script>
	let y = 1;
	let z = 2;
	function f() {}
	function sink() {}
	const fade = () => {};
</script>
{#each [y satisfies string] as q}<p>{q}</p>{/each}
