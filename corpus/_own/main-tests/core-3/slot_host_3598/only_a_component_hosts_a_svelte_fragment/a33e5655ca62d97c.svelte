<svelte:options runes={false} />

<script>
	import Comp from "./Comp.svelte";
	export let depth = 0;
</script>

{#if depth < 1}
	<svelte:component this={Comp}>
		<svelte:fragment slot="head">h</svelte:fragment>
	</svelte:component>
{:else}
	<slot name="head" />
{/if}
