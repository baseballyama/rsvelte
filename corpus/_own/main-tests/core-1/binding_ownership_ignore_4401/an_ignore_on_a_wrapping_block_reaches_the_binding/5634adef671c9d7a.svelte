<script>
	let { item } = $props();
</script>

<!-- svelte-ignore ownership_invalid_mutation -->
{#if true}<input bind:value={item.heading} />{/if}
