<script>
	const items = $state([{ value: 'a' }]);
	const { sink, other } = $props();
</script>

{#each items as item, i (item.value)}
	<button onclick={() => {
switch (i) { case 0: sink(1); }
	}}>x</button>
{/each}
