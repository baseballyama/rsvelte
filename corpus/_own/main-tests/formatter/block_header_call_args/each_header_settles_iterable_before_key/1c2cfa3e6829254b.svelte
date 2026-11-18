{#each wrap(inner({ a: 1, b: 2 }), { c: 3 }) as item (getRows({ limit: 20 }))}
	<p>x</p>
{/each}
