<script>
	const style = '<style>.x { color: red; }</style>';
	const frag = '<em>f</em>';
</script>

<svelte:head>{@html style}</svelte:head>
<svelte:element this={'div'}>{@html frag}</svelte:element>
