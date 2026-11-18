<script>
	let { rows = [{ id: 1, n: 2 }] } = $props();
	const promise = Promise.resolve(3);
</script>

{#each rows as row (row.id)}
	{@const doubled = row.n * 2}
	{@const { id, ...rest } = row}
	<p>{doubled} {id} {Object.keys(rest).length}</p>
{/each}

{#if rows.length}
	{@const first = rows[0]}
	<p>{first.n}</p>
{:else}
	{@const empty = true}
	<p>{empty}</p>
{/if}

{#await promise then value}
	{@const tripled = value * 3}
	<p>{tripled}</p>
{:catch}
	{@const failed = 'yes'}
	<p>{failed}</p>
{/await}

{#key rows.length}
	{@const k = rows.length}
	<p>{k}</p>
{/key}

{#snippet row(n)}
	{@const label = `#${n}`}
	<span>{label}</span>
{/snippet}

<svelte:boundary>
	{@const inside = 'boundary'}
	<p>{inside}</p>
</svelte:boundary>

{@render row(1)}
