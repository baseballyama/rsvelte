<script>
	let rows = $state([{ id: 1, label: 'a' }]);
	let prefix = $state('>');
</script>

{#each rows as row (row.id)}
	{#snippet cell(field, fallback = row.label)}
		<td>{prefix}{row[field] ?? fallback}</td>
	{/snippet}
	<tr>
		{@render cell('label')}
		{@render cell('missing', 'none')}
	</tr>
{/each}

{#snippet pair(a, b = a * 2, c = a + b)}
	<span>{a},{b},{c}</span>
{/snippet}

{@render pair(1)}
