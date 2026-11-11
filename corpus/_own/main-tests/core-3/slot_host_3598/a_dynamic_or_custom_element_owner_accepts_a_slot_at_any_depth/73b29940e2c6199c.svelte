<svelte:options runes={false} />

<script>
	import Comp from "./Comp.svelte";
	export let depth = 0;
</script>

{#if depth < 1}
	<svelte:element this={"div"}>
		<b slot="head">h</b>
	</svelte:element>
{:else}
	<slot name="head" />
{/if}
