<script>
	let { C, n } = $props();
</script>

<C><b slot="named">{n}</b><svelte:fragment let:v>{v}</svelte:fragment></C>
