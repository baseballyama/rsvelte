<script>
	const rows = [{ value: 'row' }];
	const q = 1;
</script>

{#each rows as value (value.value)}
	{#if q}
		{@const value = 'c'}
		<b>{value}</b>
	{/if}

	{#key q}
		{@const value = 'c'}
		<b>{value}</b>
	{/key}

	{#each rows as r}
		{@const value = 'c'}
		<b>{value}{r.value}</b>
	{/each}

	{#await Promise.resolve(1) then _}
		{@const value = 'c'}
		<b>{value}</b>
	{/await}

	{#snippet inner()}
		{@const value = 'c'}
		<b>{value}</b>
	{/snippet}
	{@render inner()}

	<!-- the shadow ends with the block: this one is the item again -->
	<i>{value}</i>
{/each}

{#each rows as _r, value}
	{#if q}
		{@const value = 'c'}
		<b>{value}</b>
	{/if}

	{#snippet param(value)}
		<b>{value}</b>
	{/snippet}
	{@render param(1)}
{/each}

<!-- controls: a different name shadows nothing, and an inner each item takes
     the name back from an outer {@const} -->
{#each rows as value (value.value)}
	{#if q}
		{@const other = 'c'}
		<b>{other}{value}</b>
	{/if}
{/each}

{#if q}
	{@const value = 'c'}
	{#each rows as value (value.value)}
		<b>{value}</b>
	{/each}
{/if}

{#each rows as _r, value}
	{#if q}
		<b>{value}</b>
	{/if}
{/each}
