<script module lang="ts">
	export const m = 1;
</script>
{#each [1] as q}<p>{(<T,>(a: T) => a)(1)}</p>{/each}
