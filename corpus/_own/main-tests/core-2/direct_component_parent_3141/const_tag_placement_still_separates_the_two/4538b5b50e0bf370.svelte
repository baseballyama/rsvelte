<script>
	let { C, n, x, depth = 0 } = $props();
</script>

{#if depth < 2}<svelte:self depth={depth + 1}>{@const c = n}<b>{c}</b></svelte:self>{/if}
