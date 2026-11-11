<script>
	let { C, n, x, depth = 0 } = $props();
</script>

<svelte:component this={C}>{@const c = n}<b>{c}</b></svelte:component>
