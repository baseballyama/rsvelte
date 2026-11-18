<script>import List from "./List.svelte"; let { children, item: outer } = $props();</script>
<List>
	{#snippet item(value)}<span>{value}</span>{/snippet}
	{#snippet children(value)}{@render children?.(value)}{/snippet}
</List>
<List>
	{#snippet header()}<h1>Title</h1>{/snippet}
	<p>Body</p>
</List>
