<script>
	let { C, n } = $props();
</script>

<C><svelte:fragment slot="named">{n}</svelte:fragment><i>{n}</i></C>
