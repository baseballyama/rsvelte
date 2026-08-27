<svelte:boundary>
	{#snippet children()}
		{@const value = 'children'}
	{/snippet}

	{#snippet failed()}
		{value}
	{/snippet}
</svelte:boundary>
