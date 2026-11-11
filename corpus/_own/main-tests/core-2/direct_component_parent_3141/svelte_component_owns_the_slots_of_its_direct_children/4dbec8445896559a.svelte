<script>
	let { C, n, x, depth = 0 } = $props();
</script>

<svelte:component this={C}><b slot="named">{n}</b></svelte:component>
