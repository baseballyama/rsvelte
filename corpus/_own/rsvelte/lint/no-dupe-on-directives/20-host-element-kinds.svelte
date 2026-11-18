<script>
	const h = () => {};
	let tag = "div";
</script>

<svelte:document on:click={h} on:click={h} />
<svelte:head><title>t</title></svelte:head>
<svelte:element this={tag} on:click={h} on:click={h}>t</svelte:element>
<slot on:click={h} on:click={h} />
