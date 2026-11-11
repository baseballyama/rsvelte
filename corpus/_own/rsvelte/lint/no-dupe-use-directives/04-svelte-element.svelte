<script>
	let foo = () => {};
</script>

<svelte:element this="div" use:foo use:foo>x</svelte:element>
