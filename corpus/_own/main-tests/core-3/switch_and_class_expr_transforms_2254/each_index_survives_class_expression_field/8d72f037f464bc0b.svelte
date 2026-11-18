<script>
	const items = $state([{ value: 'a' }]);
	const { sink, other } = $props();
</script>

{#each items as item, i (item.value)}
	<button onclick={() => {
sink(class { f = i; });
	}}>x</button>
{/each}
