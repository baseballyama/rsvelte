{#snippet outer(a)}
	<b>{a}</b>
	{#snippet inner(b)}
		<i>{b}</i>
	{/snippet}
	{@render inner(a)}
{/snippet}

{@render outer('x')}
