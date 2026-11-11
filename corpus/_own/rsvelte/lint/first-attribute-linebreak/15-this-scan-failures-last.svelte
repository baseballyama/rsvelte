<script>
	import C from "./C.svelte";
	let tag = "div";
</script>

<svelte:element
	id="a"
	this={/* c */ tag}>comment</svelte:element>
<svelte:element
	id="b"
	this={(tag)}>parens</svelte:element>
