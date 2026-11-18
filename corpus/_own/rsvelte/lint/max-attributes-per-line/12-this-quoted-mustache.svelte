<script>
	import C from "./C.svelte";
	let tag = "div";
</script>

<svelte:element id="a" this="{tag}">t</svelte:element>
<svelte:component id="b" this="{C}" />
