<script>
	const tag = 'em';
	const markup = `<${tag}>hi</${tag}>`;
	let dyn = $state('<b>d</b>');
</script>

{@html markup}
{@html '<i>lit</i>'}
{@html dyn}
<svelte:element this={tag}>static this</svelte:element>
