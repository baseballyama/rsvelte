<script>let { header, footer, items } = $props();</script>
{@render header()}
<div>{@render footer?.(items)}</div>
{#each items as item}{@render item.view()}{/each}
