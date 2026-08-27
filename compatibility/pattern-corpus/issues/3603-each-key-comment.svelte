<script>
	let rows = $state([{ id: 1 }]);
</script>

{#each rows as row (/* key */ row.id)}
	<b>{row.id}</b>
{/each}

{#each rows as row (/* key ( */ row.id)}
	<i>{row.id}</i>
{/each}
