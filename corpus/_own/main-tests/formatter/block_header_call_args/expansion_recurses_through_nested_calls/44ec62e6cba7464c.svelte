{#each wrapOuter(innerCall({ a: 1, b: 2, c: 3 }), { d: 4, e: 5 }) as months, id (id)}
	<p>x</p>
{/each}
