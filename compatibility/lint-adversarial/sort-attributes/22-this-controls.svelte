<script>
	import C from "./C.svelte";
	let tag = "div";
</script>

<svelte:element id="a" this={1 > 2 ? "div" : "span"}>gt in expr</svelte:element>
<svelte:element id="b" this={tag /* c */}>trailing comment</svelte:element>
<svelte:element id="c" this={tag}>the word this appears here</svelte:element>
<svelte:element id="d" data-x="this={q}" this={tag}>decoy value</svelte:element>
