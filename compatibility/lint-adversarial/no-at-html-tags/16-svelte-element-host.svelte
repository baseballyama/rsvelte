<script>
	let tag = 'div';
	let raw = '<b>x</b>';
</script>

<svelte:element this={tag}>{@html raw}</svelte:element>
<svelte:head>{@html '<meta name="x" />'}</svelte:head>
