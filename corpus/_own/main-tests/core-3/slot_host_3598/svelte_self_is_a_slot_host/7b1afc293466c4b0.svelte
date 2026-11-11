<svelte:options runes={false} />

<script>
	import Comp from "./Comp.svelte";
	export let depth = 0;
</script>

{#if depth < 1}
	<svelte:component this={Comp}>
		<b slot="head">h</b>
	</svelte:component>
{:else}
	<slot name="head" />
{/if}
