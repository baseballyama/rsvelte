<svelte:options runes={false} />

<script>
	import Comp from "./Comp.svelte";
	export let depth = 0;
</script>

{#if depth < 1}
	<my-el><span><b slot="head">h</b></span></my-el>
{:else}
	<slot name="head" />
{/if}
