<script>
	const items = $state([{ value: 'a' }]);
	const { sink, other } = $props();
</script>

{#each items as item (item.value)}
	<button onclick={() => {
if (other) throw item.value;
		return item.value;
	}}>x</button>
{/each}
