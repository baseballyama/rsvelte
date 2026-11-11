<svelte:options runes={false} />

<script>
	import Comp from "./Comp.svelte";
	export let depth = 0;
</script>

{#if depth < 1}
	<div>
		<svelte:fragment>h</svelte:fragment>
	</div>
{:else}
	<slot name="head" />
{/if}
