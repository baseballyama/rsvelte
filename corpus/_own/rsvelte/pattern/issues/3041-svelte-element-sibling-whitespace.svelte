<script>
	let tag = $state('div');
	let level = $state(2);
</script>

<svelte:element this={tag}>plain</svelte:element>
<svelte:element this={`h${level}`}>heading</svelte:element>

<svg viewBox="0 0 10 10">
	<circle r="4" />
</svg>
