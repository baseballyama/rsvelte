<script>
	let Comp = null;
	let title = 't';
	let value = 'v';
</script>

<svelte:element this="div" title={title}>a</svelte:element>
<svelte:component this={Comp} value={value} />
<svelte:element this={"section"} title={title}>b</svelte:element>
