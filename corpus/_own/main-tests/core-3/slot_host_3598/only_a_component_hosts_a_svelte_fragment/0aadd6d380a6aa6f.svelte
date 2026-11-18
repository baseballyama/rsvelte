<svelte:options runes={false} />

<script>
	import Comp from "./Comp.svelte";
	export let depth = 0;
</script>

{#if depth < 1}
	<svelte:element this={"div"}>
		<svelte:fragment>h</svelte:fragment>
	</svelte:element>
{:else}
	<slot name="head" />
{/if}
