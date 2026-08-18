<script>
	let Comp = null;
	let value = 'v';
	let active = true;
	let color = 'red';
</script>

<svelte:component this={Comp} bind:value={value} />
<svelte:element this="div" class:active={active} style:color={color}>a</svelte:element>
