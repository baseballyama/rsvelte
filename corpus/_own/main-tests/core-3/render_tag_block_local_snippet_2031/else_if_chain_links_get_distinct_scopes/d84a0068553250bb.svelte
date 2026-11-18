<script>
	let a = $state(0);
</script>

{#if a === 1}
	{#snippet row()}<b>one</b>{/snippet}
	{@render row()}
{:else if a === 2}
	{#snippet row()}<b>two</b>{/snippet}
	{@render row()}
{:else}
	{#snippet row()}<b>other</b>{/snippet}
	{@render row()}
{/if}