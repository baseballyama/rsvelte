<script>
	import Self from './component-children-zoo.svelte';

	let { depth = 0, children, header } = $props();
</script>

{#if header}{@render header(depth)}{/if}

{#snippet localHeader(d)}
	<h3>{d}</h3>
{/snippet}

{#if depth < 2}
	<Self depth={depth + 1} header={localHeader}>
		{#snippet children()}
			<i>nested {depth}</i>
		{/snippet}
	</Self>
{/if}

{#if children}{@render children()}{/if}
<p>{depth}</p>
