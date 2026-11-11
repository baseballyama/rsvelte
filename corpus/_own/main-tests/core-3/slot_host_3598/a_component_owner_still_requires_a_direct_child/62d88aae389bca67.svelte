<svelte:options runes={false} />

<script>
	import Comp from "./Comp.svelte";
	export let depth = 0;
</script>

{#if depth < 1}
	<svelte:self depth={1}><div><b slot="head">h</b></div></svelte:self>
{:else}
	<slot name="head" />
{/if}
