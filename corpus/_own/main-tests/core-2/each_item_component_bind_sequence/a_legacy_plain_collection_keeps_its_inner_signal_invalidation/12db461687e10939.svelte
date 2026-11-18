<script>
	export let plain = [];
</script>

{#each plain as item}
	<Toggle bind:value={item.value} />
{/each}
