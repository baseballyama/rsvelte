<script>
	let list = $state([{ x: 1 }]);
</script>

{#each list as item}<svelte:self bind:value={item.x} />{/each}
