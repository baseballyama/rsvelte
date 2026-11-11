<script module lang="ts">
	export const m = 1;
</script>
{#each [((a: string) => a)("")] as q}<p>{q}</p>{/each}
