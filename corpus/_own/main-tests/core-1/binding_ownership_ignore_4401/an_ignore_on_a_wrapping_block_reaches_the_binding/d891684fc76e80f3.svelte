<script>
	let { item } = $props();
</script>

<!-- svelte-ignore ownership_invalid_mutation -->
{#each [1] as i}<input bind:value={item.heading} />{/each}
