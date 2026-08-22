<script>
	let t = 'div';
	let handler = () => {};
</script>

<svelte:element this={t} class="a">this counts as an attribute</svelte:element>
<svelte:element class="a" this={t} id="b">this in the middle</svelte:element>
<svelte:component this={handler} prop="p" />
