<script>
	let rows = $state([{ id: 1, picked: [] }]);
</script>

{#each rows as row (row)}
	<button onclick={() => row.picked = 1}>x</button>
{/each}
