<script module lang="ts">
	export const m = 1;
</script>
{#each [(<T,>(a: T) => a)(1)] as q}<p>{q}</p>{/each}
