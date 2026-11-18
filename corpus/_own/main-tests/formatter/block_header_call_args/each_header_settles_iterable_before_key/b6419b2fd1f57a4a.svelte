{#each getRows({ limit: 20 }) as item (wrap(inner({ a: 1, b: 2 }), { c: 3 }))}
	<p>x</p>
{/each}
