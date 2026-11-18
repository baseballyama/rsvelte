{#snippet row(/* p */ a /* q */, b = /* r */ 2 /* s */)}
	<td>{a}{b}</td>
{/snippet}

<table><tbody><tr>{@render row(1)}</tr></tbody></table>
