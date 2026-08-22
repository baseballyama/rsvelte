<script>
	import C from "./C.svelte";
	let tag = "div";
</script>

<svelte:element id="a" this = {tag}>nbsp</svelte:element>
<svelte:element id="b" this={tag}>formfeed</svelte:element>
<svelte:component id="c" this = {C} />
