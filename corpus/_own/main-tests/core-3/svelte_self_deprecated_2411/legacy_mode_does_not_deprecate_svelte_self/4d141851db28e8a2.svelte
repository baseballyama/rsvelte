<script>
	export let n = 5;
</script>

{#if n === 0}
	<p>lift-off!</p>
{:else}
	<p>{n}</p>
	<svelte:self n={n - 1} />
{/if}
