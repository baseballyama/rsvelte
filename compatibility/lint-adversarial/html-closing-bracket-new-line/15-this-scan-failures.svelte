<script>
	import C from "./C.svelte";
	let tag = "div";
</script>

<svelte:element
	id="a"
	this="{tag}">quoted</svelte:element>
<svelte:element
	id="b"
	this={(tag)}>parens</svelte:element>
