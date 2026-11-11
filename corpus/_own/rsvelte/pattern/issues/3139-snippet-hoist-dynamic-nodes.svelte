<script>
	const TAG = 'b';
	let { depth = 0 } = $props();
	let n = $state(1);
</script>

{#snippet hoistable_element(d)}
	<svelte:element this={d.tag}>{d.v}</svelte:element>
{/snippet}

{#snippet hoistable_self(d)}
	<svelte:self depth={d + 1}><b>{d}</b></svelte:self>
{/snippet}

{#snippet pinned_element(d)}
	<svelte:element this={TAG}>{d}</svelte:element>
{/snippet}

{#snippet pinned_self(d)}
	<svelte:self depth={n} />
{/snippet}

{@render hoistable_element({ tag: 'i', v: depth })}
{@render hoistable_self(depth)}
{@render pinned_element(depth)}
{@render pinned_self(depth)}
