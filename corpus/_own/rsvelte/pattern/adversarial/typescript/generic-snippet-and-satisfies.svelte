<script lang="ts" generics="T extends { id: number }, U = string">
	type Row = { id: number; label: U };

	let { rows, fallback }: { rows: T[]; fallback: U } = $props();

	const conf = { mode: 'list', size: 2 } satisfies { mode: 'list' | 'grid'; size: number };
	const keys = ['a', 'b'] as const;

	function pick<K extends keyof Row>(row: Row, key: K): Row[K] {
		return row[key];
	}

	let first = $derived(rows[0] satisfies T | undefined);
</script>

{#snippet cell(row: T, label: U = fallback)}
	<td>{row.id} {String(label)}</td>
{/snippet}

<table>
	<tbody>
		{#each rows as row (row.id)}
			<tr>{@render cell(row)}</tr>
		{/each}
	</tbody>
</table>

<p>{conf.mode}{conf.size} {keys.join('')} {String(pick({ id: 1, label: fallback }, 'id'))}</p>
<p>{first ? first.id : '-'}</p>
