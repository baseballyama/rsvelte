<script>
	const items = $state([{ value: 'a' }]);
	const { sink, other } = $props();
</script>

{#each items as item, i (item.value)}
	<button onclick={() => {
sink(class { [i]() {} });
	}}>x</button>
{/each}
