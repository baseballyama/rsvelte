<script>
	import C from "./C.svelte";
	let tag = "div";
</script>

<svelte:element id = "a" this = {(tag)}>parens</svelte:element>
<svelte:element id = "b" this = {/* c */ tag}>comment</svelte:element>
