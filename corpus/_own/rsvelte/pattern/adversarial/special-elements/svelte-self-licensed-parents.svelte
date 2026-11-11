<script>
	import C from './C.svelte';

	let { depth = 0 } = $props();
</script>

{#if depth < 1}
	<svelte:self depth={depth + 1} />
{/if}

{#each [depth] as d (d)}
	<svelte:self depth={d + 1} />
{/each}

{#snippet deeper(d)}
	<svelte:self depth={d + 1} />
{/snippet}
{@render deeper(depth)}

<C>
	<svelte:self depth={depth + 1} />
</C>

<C>
	<svelte:fragment slot="s">
		<svelte:self depth={depth + 1} />
	</svelte:fragment>
</C>

{#if depth < 1}
	{#await Promise.resolve(1) then v}
		<svelte:self depth={depth + v} />
	{/await}
{/if}
