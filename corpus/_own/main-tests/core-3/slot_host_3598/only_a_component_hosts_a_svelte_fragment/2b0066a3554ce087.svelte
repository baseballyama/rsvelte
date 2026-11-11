<svelte:options runes={false} />

<script>
	import Comp from "./Comp.svelte";
	export let depth = 0;
</script>

{#if depth < 1}
	<svelte:self depth={1}>
		<svelte:fragment>h</svelte:fragment>
	</svelte:self>
{:else}
	<slot name="head" />
{/if}
