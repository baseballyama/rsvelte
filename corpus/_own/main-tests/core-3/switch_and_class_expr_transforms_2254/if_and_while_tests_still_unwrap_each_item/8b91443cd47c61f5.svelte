<script>
	const items = $state([{ value: 'a' }]);
	const { sink, other } = $props();
</script>

{#each items as item (item.value)}
	<button onclick={() => {
if (item.value === 'a') sink(1);
		while (item.value === 'never') break;
	}}>x</button>
{/each}
