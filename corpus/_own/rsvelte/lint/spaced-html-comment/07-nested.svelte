<script>
	let items = [1];
	let c = true;
</script>

{#each items as i}
	<!--in each-->
	{i}
{/each}
{#if c}
	<!--in if -->
{/if}
<svelte:head>
	<!-- in head-->
</svelte:head>
{#snippet s()}
	<!--in snippet-->
{/snippet}
{@render s()}
