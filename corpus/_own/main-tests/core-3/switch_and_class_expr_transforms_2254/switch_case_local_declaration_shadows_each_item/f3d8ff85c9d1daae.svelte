<script>
	const items = $state([{ value: 'a' }]);
	const { sink, other } = $props();
</script>

{#each items as item (item.value)}
	<button onclick={() => {
switch (other) { case 1: { let item = 1; sink(item); } }
	}}>x</button>
{/each}
