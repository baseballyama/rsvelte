<script>
	let { C, n, x, depth = 0 } = $props();
</script>

<svelte:element this={x}><b slot="named">{n}</b></svelte:element>
