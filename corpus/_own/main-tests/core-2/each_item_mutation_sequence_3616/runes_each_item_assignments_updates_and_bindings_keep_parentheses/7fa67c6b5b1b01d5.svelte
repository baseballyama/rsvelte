<script>
	let rows = $state([{ picked: [], name: '', n: 0 }]);
</script>

{#each rows as row, i}
	<button onclick={() => row.picked = 1}>assign</button>
	<button onclick={() => row.n++}>update</button>
	<input bind:value={row.name} />
	<input type="checkbox" value={i} bind:group={row.picked} />
{/each}
