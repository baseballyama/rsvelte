<script>
	let rows = $state([
		[1, 2],
		[3, 4],
	]);
</script>

<table>
	<caption>numbers</caption>
	<colgroup>
		<col span="2" />
	</colgroup>
	<thead>
		<tr>
			<th scope="col">a</th>
			<th scope="col">b</th>
		</tr>
	</thead>
	<tbody>
		{#each rows as row, i}
			<tr class:odd={i % 2 === 1}>
				{#each row as cell}
					<td>{cell}</td>
				{/each}
			</tr>
		{/each}
	</tbody>
	<tfoot>
		<tr>
			<td colspan="2">end</td>
		</tr>
	</tfoot>
</table>

<style>
	.odd {
		background: #eee;
	}
</style>
