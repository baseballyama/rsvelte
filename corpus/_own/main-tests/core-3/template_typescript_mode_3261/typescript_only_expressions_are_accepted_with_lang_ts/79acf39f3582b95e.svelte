<script lang="ts">
	let y = 1;
	let z = 2;
	function f() {}
	function sink() {}
	const fade = () => {};
</script>
{#each [((a: string) => a)("")] as q}<p>{q}</p>{/each}
