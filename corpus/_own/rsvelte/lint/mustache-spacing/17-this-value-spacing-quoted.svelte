<script>
	import C from "./C.svelte";
	let tag = "div";
</script>

<svelte:element this="{ tag }">t</svelte:element>
<svelte:element id="a" this={	tag	}>u</svelte:element>
