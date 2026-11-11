<svelte:options runes={false} />

<script>
	import Comp from "./Comp.svelte";
	export let depth = 0;
</script>

{#if depth < 1}
	<Comp>{#await Promise.resolve(1) then _}<svelte:fragment slot="head">h</svelte:fragment>{/await}</Comp>
{:else}
	<slot name="head" />
{/if}
