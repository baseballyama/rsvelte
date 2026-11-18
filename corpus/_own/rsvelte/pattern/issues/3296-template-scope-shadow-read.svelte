<script>
	let base = $state(1);
	let value = $derived(base + 1);
</script>

{#each ['item'] as value}
	{#if true}
		{@const rendered = String(value)}
		{rendered}
	{/if}
{/each}
