<script>
	let { C, n, x, depth = 0 } = $props();
</script>

<svelte:element this={x}><svelte:fragment slot="named">{n}</svelte:fragment></svelte:element>
