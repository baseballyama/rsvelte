<svelte:options runes={false} />

<script>
	import Comp from "./Comp.svelte";
	export let depth = 0;
</script>

{#if depth < 1}
	<Comp><slot name="s"><svelte:fragment slot="head">h</svelte:fragment></slot></Comp>
{:else}
	<slot name="head" />
{/if}
