<script>
	let tag = 'div';
	let o = $state({ x: 0 });
	let v = $state({ y: 1 });
</script>

<svelte:element this={tag} onclick={() => (o.x = v)}></svelte:element>
