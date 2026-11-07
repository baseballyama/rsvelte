<!-- this is semantically the same as the above -->
<Table data={fruits}>
	{#snippet header()}
		<th>fruit</th>
		<th>qty</th>
		<th>price</th>
		<th>total</th>
	{/snippet}

	{#snippet row(d)}
		<td>{d.name}</td>
		<td>{d.qty}</td>
		<td>{d.price}</td>
		<td>{d.qty * d.price}</td>
	{/snippet}
</Table>
