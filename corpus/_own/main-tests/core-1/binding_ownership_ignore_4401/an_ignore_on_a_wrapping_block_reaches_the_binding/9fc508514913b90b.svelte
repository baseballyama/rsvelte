<script>
	let { item } = $props();
</script>

{#each [1] as i}<input bind:value={item.heading} />{/each}
