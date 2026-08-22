<script>
	let items = $state([{ id: 1, k: 'a' }, { id: 2, k: 'b' }]);
	let n = $state(0);
	const tuple = (x) => `${x.id}:${x.k}`;
</script>

{#each items as item (item)}
	<p>{item.id}</p>
{/each}

{#each items as item (tuple(item))}
	<p>{item.k}</p>
{/each}

{#each items as item, i (i)}
	<p>{i}</p>
{/each}

{#each items as item (`${item.id}-${n}`)}
	<p>{item.id}</p>
{/each}

{#each items as { id, ...rest } (id)}
	<p>{id} {Object.keys(rest).length}</p>
{/each}

{#each items.map((x) => x.k) as key, i (key + i)}
	<p>{key}</p>
{/each}

{#each 'abc' as ch, i (ch)}
	<span>{i}{ch}</span>
{/each}
