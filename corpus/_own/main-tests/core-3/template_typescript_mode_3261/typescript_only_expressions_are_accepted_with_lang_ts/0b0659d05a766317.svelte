<script lang="ts">
	let y = 1;
	let z = 2;
	function f() {}
	function sink() {}
	const fade = () => {};
</script>
{#each [1] as q}<p>{(<T,>(a: T) => a)(1)}</p>{/each}
