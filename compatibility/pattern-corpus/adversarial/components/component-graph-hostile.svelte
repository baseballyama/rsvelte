<script>
	import Self from './component-graph-hostile.svelte';

	let { depth = 2, header, ...rest } = $props();
	let value = $state('v');
	const extra = { a: 1, b: 2 };
</script>

{#snippet row(n)}
	<li>{n}</li>
{/snippet}

{#if depth > 0}
	<Self depth={depth - 1} {...extra} {...rest} bind:value {header}>
		{#snippet children()}
			<ul>{@render row(depth)}</ul>
		{/snippet}
	</Self>
{/if}

<svelte:component this={depth > 1 ? Self : null} depth={0} />

<p>{value} {Object.keys(rest).length}</p>
{@render header?.(depth)}
