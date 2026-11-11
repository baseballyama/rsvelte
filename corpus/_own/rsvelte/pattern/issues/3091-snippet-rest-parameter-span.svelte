{#snippet ok({ a, ...rest })}
	<b>{a}{Object.keys(rest).length}</b>
{/snippet}

{@render ok({ a: 1, b: 2 })}
