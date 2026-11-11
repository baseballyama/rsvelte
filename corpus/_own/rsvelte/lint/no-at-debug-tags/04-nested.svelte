<script>
	export let items;
</script>

{#each items as item (item)}
	{@debug item}
{/each}
{#if items}
	{@debug items}
{:else}
	{@debug}
{/if}
{#snippet s(v)}
	{@debug v}
{/snippet}
{@render s(1)}
