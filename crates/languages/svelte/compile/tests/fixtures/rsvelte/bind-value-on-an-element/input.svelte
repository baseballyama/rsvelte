<script>
	let v = $state("");
</script>

<p>{v}</p>
<svelte:element this="input" bind:value={v} />
