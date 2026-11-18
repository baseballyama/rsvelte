<script>let { items, children } = $props();</script>
<ul class="list">
	{#snippet row(item, index = 0)}<li>{index}: {item.label}</li>{/snippet}
	{#each items as item, i}{@render row(item, i)}{/each}
</ul>
{#if items.length}
	{#snippet empty({ title, count = 1 })}<p>{title} {count}</p>{/snippet}
	{@render empty({ title: "none" })}
{/if}
{@render children?.()}
