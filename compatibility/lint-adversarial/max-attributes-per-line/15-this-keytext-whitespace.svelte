<script>
	import C from "./C.svelte";
	let tag = "div";
</script>

<svelte:element id="a" this = {tag}>space</svelte:element>
<svelte:element id="b" this	=	{tag}>tab</svelte:element>
<svelte:element id="c" this
	=
	{tag}>newline</svelte:element>
