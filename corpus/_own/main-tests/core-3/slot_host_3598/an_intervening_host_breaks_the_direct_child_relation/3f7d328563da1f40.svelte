<svelte:options runes={false} />

<script>
	import Comp from "./Comp.svelte";
	export let depth = 0;
</script>

{#if depth < 1}
	<Comp><svelte:element this={"div"}><svelte:fragment slot="head">h</svelte:fragment></svelte:element></Comp>
{:else}
	<slot name="head" />
{/if}
