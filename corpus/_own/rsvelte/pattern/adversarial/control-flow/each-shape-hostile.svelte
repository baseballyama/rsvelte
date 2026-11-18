<script>
	let rows = $state([{ id: 1, tags: ['a'] }]);
	let n = $state(3);
	const map = new Map([['k', 1]]);
	const set = new Set([1, 2]);
</script>

{#each { length: n } as _, i}<i>{i}</i>{/each}
{#each Array.from({ length: n }, (_, i) => i) as v}<b>{v}</b>{/each}
{#each map as [key, value] (key)}<u>{key}{value}</u>{/each}
{#each set as v, i (v)}<s>{v}{i}</s>{/each}
{#each rows as { id, tags: [first = 'z', ...rest] }, idx (id)}
	<p>{id}{first}{rest.length}{idx}</p>
{/each}
{#each rows.filter((r) => r.id > 0).map((r) => ({ ...r })) as row (row.id)}
	<em>{row.id}</em>
{/each}
{#each [] as nothing}<i>{nothing}</i>{:else}<i>empty</i>{/each}
{#each rows as row}
	{#each row.tags as tag}
		{#each tag as ch}<code>{ch}</code>{/each}
	{/each}
{/each}
<button onclick={() => n++}>{n}</button>
