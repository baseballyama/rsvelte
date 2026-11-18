<svelte:options runes={false} />

<script>
	import Comp from "./Comp.svelte";
	export let depth = 0;
</script>

{#if depth < 1}
	<svelte:boundary>
		<b slot="head">h</b>
	</svelte:boundary>
{:else}
	<slot name="head" />
{/if}
