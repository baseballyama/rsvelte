<script>
	let sortKey = $state('name');
	let sortDir = $state(1);
	let query = $state('');

	let rows = $state([
		{ id: 1, name: 'Alice', role: 'Engineer', score: 92, active: true },
		{ id: 2, name: 'Bob', role: 'Designer', score: 78, active: false },
		{ id: 3, name: 'Carol', role: 'Manager', score: 85, active: true },
		{ id: 4, name: 'Dave', role: 'Engineer', score: 64, active: true },
		{ id: 5, name: 'Erin', role: 'Analyst', score: 88, active: false },
		{ id: 6, name: 'Frank', role: 'Designer', score: 71, active: true }
	]);

	let filtered = $derived(
		rows.filter((r) => r.name.toLowerCase().includes(query.toLowerCase()))
	);

	let sorted = $derived(
		[...filtered].sort((a, b) => {
			const av = a[sortKey];
			const bv = b[sortKey];
			if (av < bv) return -1 * sortDir;
			if (av > bv) return 1 * sortDir;
			return 0;
		})
	);

	let average = $derived(
		sorted.length ? Math.round(sorted.reduce((s, r) => s + r.score, 0) / sorted.length) : 0
	);

	function sortBy(key) {
		if (sortKey === key) {
			sortDir *= -1;
		} else {
			sortKey = key;
			sortDir = 1;
		}
	}
</script>

<div class="table-wrap">
	<div class="toolbar">
		<input placeholder="Filter by name…" bind:value={query} />
		<span class="avg">Average score: {average}</span>
	</div>

	<table>
		<thead>
			<tr>
				{#each [['name', 'Name'], ['role', 'Role'], ['score', 'Score']] as [key, label]}
					<th onclick={() => sortBy(key)} class:sorted={sortKey === key}>
						{label}
						{#if sortKey === key}
							<span class="arrow">{sortDir === 1 ? '▲' : '▼'}</span>
						{/if}
					</th>
				{/each}
				<th>Status</th>
			</tr>
		</thead>
		<tbody>
			{#each sorted as row (row.id)}
				<tr class:inactive={!row.active}>
					<td>{row.name}</td>
					<td>{row.role}</td>
					<td class="num">{row.score}</td>
					<td>
						<span class="badge" class:on={row.active}>
							{row.active ? 'Active' : 'Inactive'}
						</span>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	{#if sorted.length === 0}
		<p class="empty">No matching rows.</p>
	{/if}
</div>

<style>
	.table-wrap {
		font-family: system-ui, sans-serif;
	}

	.toolbar {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.5rem;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th {
		cursor: pointer;
		text-align: left;
		user-select: none;
	}

	th.sorted {
		color: #2563eb;
	}

	td.num {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	tr.inactive {
		opacity: 0.5;
	}

	.badge {
		padding: 0.1rem 0.4rem;
		border-radius: 0.25rem;
		background: #eee;
	}

	.badge.on {
		background: #dcfce7;
		color: #166534;
	}
</style>
