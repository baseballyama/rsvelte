<script lang="ts">
	import { getContext } from 'svelte';
	import { writable, derived, get, type Writable, type Readable } from 'svelte/store';

	interface Row {
		id: number;
		owner: string;
		status: 'open' | 'closed' | 'blocked';
		estimate: number;
		spent: number;
	}

	export let boardId: string;
	export let title = 'Board';
	export let compact = false;

	const rows: Writable<Row[]> = getContext('rows');
	const query: Writable<string> = writable('');
	const sortKey: Writable<keyof Row> = writable('id');
	const ascending: Writable<boolean> = writable(true);
	const selection: Writable<Set<number>> = writable(new Set());
	const theme: Readable<string> = getContext('theme');

	const totals = derived(rows, ($rows) => ({
		estimate: $rows.reduce((n, r) => n + r.estimate, 0),
		spent: $rows.reduce((n, r) => n + r.spent, 0)
	}));

	let editing: number | null = null;
	let draft = '';

	$: needle = $query.trim().toLowerCase();
	$: matched = needle ? $rows.filter((r) => r.owner.toLowerCase().includes(needle)) : $rows;
	$: sorted = [...matched].sort((a, b) => {
		const key = $sortKey;
		const dir = $ascending ? 1 : -1;
		return a[key] > b[key] ? dir : a[key] < b[key] ? -dir : 0;
	});
	$: open = sorted.filter((r) => r.status === 'open').length;
	$: blocked = sorted.filter((r) => r.status === 'blocked').length;
	$: overrun = $totals.spent > $totals.estimate;
	$: selectedCount = $selection.size;
	$: allSelected = sorted.length > 0 && selectedCount === sorted.length;

	$: if (overrun) {
		console.warn('over estimate on', boardId, $totals.spent, $totals.estimate);
	}

	function toggle(id: number): void {
		selection.update((set) => {
			const next = new Set(set);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}

	function toggleAll(): void {
		selection.set(allSelected ? new Set() : new Set(sorted.map((r) => r.id)));
	}

	function sortBy(key: keyof Row): void {
		if (get(sortKey) === key) ascending.update((v) => !v);
		else {
			sortKey.set(key);
			ascending.set(true);
		}
	}

	function commit(row: Row): void {
		$rows = $rows.map((r) => (r.id === row.id ? { ...r, owner: draft } : r));
		editing = null;
	}
</script>

<section class="board {$theme}" class:compact>
	<header>
		<h3>{title}</h3>
		<input type="search" placeholder="Filter owner" bind:value={$query} />
		<span>{open} open · {blocked} blocked · {selectedCount} selected</span>
	</header>

	<table>
		<thead>
			<tr>
				<th><input type="checkbox" checked={allSelected} on:change={toggleAll} /></th>
				<th on:click={() => sortBy('id')}>#</th>
				<th on:click={() => sortBy('owner')}>Owner</th>
				<th on:click={() => sortBy('status')}>Status</th>
				<th on:click={() => sortBy('estimate')}>Estimate</th>
			</tr>
		</thead>
		<tbody>
			{#each sorted as row (row.id)}
				<tr class:selected={$selection.has(row.id)} class:blocked={row.status === 'blocked'}>
					<td><input type="checkbox" on:change={() => toggle(row.id)} /></td>
					<td>{row.id}</td>
					<td>
						{#if editing === row.id}
							<input bind:value={draft} on:blur={() => commit(row)} />
						{:else}
							<button
								type="button"
								on:click={() => {
									editing = row.id;
									draft = row.owner;
								}}>{row.owner}</button
							>
						{/if}
					</td>
					<td>{row.status}</td>
					<td>{row.estimate}h / {row.spent}h</td>
				</tr>
			{:else}
				<tr><td colspan="5">No matching rows</td></tr>
			{/each}
		</tbody>
		<tfoot>
			<tr class:overrun>
				<td colspan="4">Total</td>
				<td>{$totals.estimate}h / {$totals.spent}h</td>
			</tr>
		</tfoot>
	</table>
</section>

<style>
	.board {
		font-size: 14px;
	}

	.compact td,
	.compact th {
		padding: 2px 4px;
	}

	th {
		cursor: pointer;
		text-align: left;
	}

	.selected {
		background: #eef4ff;
	}

	.blocked {
		color: #b3261e;
	}

	.overrun td {
		font-weight: 600;
	}
</style>
