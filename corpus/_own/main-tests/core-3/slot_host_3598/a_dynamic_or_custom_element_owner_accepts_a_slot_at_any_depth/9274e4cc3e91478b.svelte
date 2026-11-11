<svelte:options runes={false} />

<script>
	import Comp from "./Comp.svelte";
	export let depth = 0;
</script>

{#if depth < 1}
	<svelte:element this={"div"}><span><b slot="head">h</b></span></svelte:element>
{:else}
	<slot name="head" />
{/if}
