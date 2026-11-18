<script>
	let { item } = $props();
</script>

<!-- svelte-ignore ownership_invalid_mutation -->
<div bind:this={item.el}></div>
