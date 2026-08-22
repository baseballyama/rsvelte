<script>
	let tag = "div";
</script>

<svelte:element id="a" this="{tag}">t</svelte:element>
<svelte:element id="b" this={(tag)}>u</svelte:element>
