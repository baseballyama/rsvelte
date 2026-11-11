<script>
	let items = $state([{ id: 1, tags: ['a'] }]);
	const map = new Map([[1, 'one']]);
	const set = new Set([1, 2]);
	let index = $state(0);
</script>

{#each items as { id, tags: [head = 'none', ...tail] }, i (id)}
	<p>{i}: {id} {head} {tail.length}</p>
{/each}

{#each map as [key, value] (key)}
	<p>{key}={value}</p>
{/each}

{#each set as value, i}
	<p>{i}:{value}</p>
{/each}

{#each Array.from({ length: 2 }, (_, i) => i) as n}
	<p>{n}</p>
{/each}

{#each items as item, i (item.id + '-' + i)}
	{#key item.id}
		<p>{item.id}</p>
	{/key}
{:else}
	<p>empty</p>
{/each}

{#key index}
	{#key index * 2}
		<p>{index}</p>
	{/key}
{/key}
