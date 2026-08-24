{#snippet outer()}
	{#snippet middle()}
		{#snippet inner(a)}
			<i>{a}</i>
		{/snippet}
		{@render inner?.(1)}
	{/snippet}
	{@render middle?.()}
{/snippet}

{@render outer()}
