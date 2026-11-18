<svelte:options runes={false} />

<script>
	import Comp from "./Comp.svelte";
	export let depth = 0;
</script>

{#if depth < 1}
	<Comp><slot name="s"><b slot="head">h</b></slot></Comp>
{:else}
	<slot name="head" />
{/if}
