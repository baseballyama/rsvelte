<script>
	let { results } = $props();
</script>

{#each results as result}
	<p>{result.title}</p>
{:else}
	<p>No results.</p>
{/each}
