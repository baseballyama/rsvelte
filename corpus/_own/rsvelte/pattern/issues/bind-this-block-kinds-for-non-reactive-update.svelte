<svelte:options runes />

<script>
	import Comp from './Comp.svelte';

	let key_element;
	let key_component;
	let if_component;
	let each_component;
	let snippet_element;
	let top_element;
	let top_component;

	export function reachable() {
		return [
			key_element,
			key_component,
			if_component,
			each_component,
			snippet_element,
			top_element,
			top_component
		];
	}
</script>

{#key 1}
	<span bind:this={key_element}></span>
	<Comp bind:this={key_component} />
{/key}

{#if true}
	<Comp bind:this={if_component} />
{/if}

{#each [1] as _}
	<Comp bind:this={each_component} />
{/each}

{#snippet inert()}
	<span bind:this={snippet_element}></span>
{/snippet}
{@render inert()}

<span bind:this={top_element}></span>
<Comp bind:this={top_component} />
