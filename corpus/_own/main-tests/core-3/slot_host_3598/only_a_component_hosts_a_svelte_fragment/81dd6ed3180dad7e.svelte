<svelte:options runes={false} />

<script>
	import Comp from "./Comp.svelte";
	export let depth = 0;
</script>

{#if depth < 1}
	<Comp>
		<svelte:fragment slot="head">h</svelte:fragment>
	</Comp>
{:else}
	<slot name="head" />
{/if}
