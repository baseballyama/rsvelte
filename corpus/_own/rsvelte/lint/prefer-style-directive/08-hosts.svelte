<script>
	import C from './01-basic-decl.svelte';
	let tag = 'div';
</script>

<C style="color: red" />
<svelte:element this={tag} style="color: red">1</svelte:element>
<svelte:element this="span" style="margin: 0">2</svelte:element>
