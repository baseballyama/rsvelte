<script>
	import C from "./C.svelte";
	let tag = "div";
</script>

<svelte:element id="a" this="{tag}" >quoted</svelte:element>
<svelte:element id="b" this={/* c */ tag} >comment</svelte:element>
<svelte:element id="c" this={(tag)} >parens</svelte:element>
