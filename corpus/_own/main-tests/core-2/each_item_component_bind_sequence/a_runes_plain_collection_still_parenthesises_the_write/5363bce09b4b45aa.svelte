<script>
	let plain = $state([{ value: 1 }]);
</script>

{#each plain as item}
	<Toggle bind:value={item.value} />
{/each}
