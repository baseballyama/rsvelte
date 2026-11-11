<script>
	let { n = 5 } = $props();
</script>

{#if n === 0}
	<p>lift-off!</p>
{:else}
	<svelte:self n={n - 1} />
{/if}
