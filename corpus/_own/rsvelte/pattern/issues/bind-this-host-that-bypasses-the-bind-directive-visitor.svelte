<script>
	import C from './C.svelte';

	let tag = 'p';
	let on = $state(true);
	let plain;
	let inside;
	let snippeted;
	let value;
	export function reachable() {
		return [plain, inside, snippeted, value];
	}
</script>

<!-- No `{#if}` / `{#each}` / `{#await}` / `{#key}` above the `bind:this`, so the
     reference never changes and none of these needs state. -->
<svelte:element this={tag} bind:this={plain} />
<svelte:component this={C} bind:this={plain} />

{#snippet inSnippet()}
	<svelte:element this={tag} bind:this={snippeted} />
	<svelte:component this={C} bind:this={snippeted} />
	<svelte:self bind:this={snippeted} />
{/snippet}
{@render inSnippet()}

<!-- Under a block, every one of them must warn. -->
{#if on}
	<svelte:element this={tag} bind:this={inside} />
	<svelte:component this={C} bind:this={inside} />
	<svelte:self bind:this={inside} />
{/if}

<!-- A non-`this` bind is a direct template read wherever it sits. -->
<input bind:value />
