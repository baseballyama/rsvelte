<script>
	const items = $state([{ value: 'a' }]);
	const { sink, other } = $props();
</script>

{#each items as item (item.value)}
	<button onclick={() => {
sink(class { f = item.value; });
	}}>x</button>
{/each}
