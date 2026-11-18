<script>
	let { C, n, x, depth = 0 } = $props();
</script>

{#if depth < 2}<svelte:self depth={depth + 1}><b slot="named">{n}</b></svelte:self>{/if}
