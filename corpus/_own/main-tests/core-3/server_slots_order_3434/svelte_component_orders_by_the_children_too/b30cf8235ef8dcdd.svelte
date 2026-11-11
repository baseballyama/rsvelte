<script>
	let { C, n } = $props();
</script>

<svelte:component this={C}><b slot="named">{n}</b><i>{n}</i></svelte:component>
