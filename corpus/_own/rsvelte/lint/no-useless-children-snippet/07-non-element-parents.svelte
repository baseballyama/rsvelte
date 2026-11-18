{#snippet children()}
	<p>top</p>
{/snippet}
{@render children()}
{#if true}
	{#snippet inner()}
		<p>n</p>
	{/snippet}
	{@render inner()}
{/if}
