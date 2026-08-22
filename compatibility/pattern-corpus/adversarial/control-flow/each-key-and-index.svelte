<script>
	let rows = $state([{ id: 'a' }, { id: 'b' }]);
	const empty = [];
</script>

{#each rows as row, i (row.id)}
	<p>{i}:{row.id}</p>
{:else}
	<p>none</p>
{/each}

{#each rows as { id }, i (id)}
	<p>{i}:{id}</p>
{/each}

{#each rows as [a = 1, ...rest] , i}
	<p>{a}{rest.length}{i}</p>
{/each}

{#each empty as x, i (i)}
	<p>{x}</p>
{:else}
	<p>empty</p>
{/each}

{#each rows.map((r) => r.id) as id (id)}
	<p>{id}</p>
{/each}

{#each { length: 2 } as _, i}
	<p>{i}</p>
{/each}
