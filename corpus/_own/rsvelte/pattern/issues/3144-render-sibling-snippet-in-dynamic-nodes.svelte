<script>
	import C from './C.svelte';

	let { depth = 0 } = $props();
	let n = $state(1);
</script>

<svelte:element this={'div'}>
	{#snippet in_element(v)}<b>{v}</b>{/snippet}
	{@render in_element(n)}
</svelte:element>

<svelte:component this={C}>
	{#snippet in_component(v)}<i>{v}</i>{/snippet}
	{@render in_component(n)}
</svelte:component>

{#if depth < 1}
	<svelte:self depth={depth + 1}>
		{#snippet in_self(v)}<u>{v}</u>{/snippet}
		{@render in_self(n)}
	</svelte:self>
{/if}
