<script>
	let { show, list } = $props();
</script>

{#if show}
	{#each list as entry}
		<span>{entry}</span>
	{/each}
{:else}
	<p>hidden</p>
{/if}
