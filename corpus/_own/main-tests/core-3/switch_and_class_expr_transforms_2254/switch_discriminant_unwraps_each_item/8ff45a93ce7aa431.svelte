<script>
	const items = $state([{ value: 'a' }]);
	const { sink, other } = $props();
</script>

{#each items as item (item.value)}
	<button onclick={() => {
switch (item.value) { case 'a': sink(1); }
	}}>x</button>
{/each}
