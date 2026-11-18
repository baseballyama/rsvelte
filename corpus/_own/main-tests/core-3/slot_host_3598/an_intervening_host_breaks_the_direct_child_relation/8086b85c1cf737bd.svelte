<svelte:options runes={false} />

<script>
	import Comp from "./Comp.svelte";
	export let depth = 0;
</script>

{#if depth < 1}
	<Comp><svelte:fragment slot="a"><b slot="head">h</b></svelte:fragment></Comp>
{:else}
	<slot name="head" />
{/if}
