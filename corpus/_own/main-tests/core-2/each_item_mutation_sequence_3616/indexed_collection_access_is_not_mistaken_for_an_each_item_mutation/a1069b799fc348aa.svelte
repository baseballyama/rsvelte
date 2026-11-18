<script>
	let rows = $state([{ picked: [] }]);
</script>

{#each rows as row, i}
	<button onclick={() => rows[i].picked = 1}>x</button>
{/each}
