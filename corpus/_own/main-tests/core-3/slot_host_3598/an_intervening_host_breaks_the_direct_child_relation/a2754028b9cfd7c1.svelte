<svelte:options runes={false} />

<script>
	import Comp from "./Comp.svelte";
	export let depth = 0;
</script>

{#if depth < 1}
	<Comp>{#await Promise.resolve(1) then _}<b slot="head">h</b>{/await}</Comp>
{:else}
	<slot name="head" />
{/if}
