<script>
	import C from "./C.svelte";
	let tag = "div";
</script>

<svelte:element this="{tag}"></svelte:element>
<svelte:element this={/* c */ tag}></svelte:element>
<svelte:element this={(tag)}></svelte:element>
<svelte:element this = {tag}></svelte:element>
