<script>
	let { C, n, x, depth = 0 } = $props();
</script>

{#if depth < 2}<svelte:self depth={depth + 1}><svelte:fragment slot="named">{n}</svelte:fragment></svelte:self>{/if}
