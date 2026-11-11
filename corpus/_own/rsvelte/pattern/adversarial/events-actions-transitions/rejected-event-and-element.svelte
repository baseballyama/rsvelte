<script>
	let value = $state('');
	const bump = () => {};
</script>

<button on:click={bump} onclick={bump}>mixing the two event syntaxes</button>
<svelte:element this="input" bind:value />
