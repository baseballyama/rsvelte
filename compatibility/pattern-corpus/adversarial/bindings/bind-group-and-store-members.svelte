<script>
	import { writable } from 'svelte/store';

	const form = writable({ tags: [], name: '' });
	let picked = $state([]);
	let radio = $state('a');
	const rows = [{ id: 1, opts: ['x', 'y'] }];
	let matrix = $state([[]]);
</script>

<input bind:value={$form.name} />

{#each ['a', 'b'] as tag}
	<input type="checkbox" bind:group={$form.tags} value={tag} />
{/each}

{#each ['a', 'b'] as tag}
	<input type="checkbox" bind:group={picked} value={tag} />
{/each}

{#each ['a', 'b'] as r}
	<input type="radio" bind:group={radio} value={r} />
{/each}

{#each rows as row, i (row.id)}
	{#each row.opts as opt}
		<input type="checkbox" bind:group={matrix[i]} value={opt} />
	{/each}
{/each}

<p>{$form.name} {$form.tags.join(',')} {picked.join(',')} {radio} {matrix[0].join(',')}</p>
