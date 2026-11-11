<script>
	import * as traverse from 'neotraverse';
</script>

{#await import('./data.json') then { default: data }}
	{const rows = traverse.reduce(
		data,
		(_context, accumulator, value) => {
			if (value && typeof value === 'object') {
				const { name, age } = value;

				if (name && age) {
					accumulator.push({ name, age });
				}
			}

			return accumulator;
		},
		[]
	)}

	<table>
		<tbody>
			{#each rows as { name, age } (name)}
				<tr>
					<td>{name}</td>
					<td>{age}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/await}
