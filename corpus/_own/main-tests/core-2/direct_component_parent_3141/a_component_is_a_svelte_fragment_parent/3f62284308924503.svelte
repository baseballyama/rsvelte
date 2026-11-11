<script>
	let { C, n, x, depth = 0 } = $props();
</script>

<C><svelte:fragment slot="named">{n}</svelte:fragment></C>
