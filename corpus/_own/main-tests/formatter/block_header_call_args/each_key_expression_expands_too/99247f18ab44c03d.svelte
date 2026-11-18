{#each items as item, index (computeKey({ id: item.id, salt: 42, another: 12345 }))}
	<p>x</p>
{/each}
