<svelte:options runes={false} />

<script>
	import Comp from "./Comp.svelte";
	export let depth = 0;
</script>

{#if depth < 1}
	<div>
		<b slot="head">h</b>
	</div>
{:else}
	<slot name="head" />
{/if}
