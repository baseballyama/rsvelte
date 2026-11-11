<svelte:boundary>
	{#snippet children()}
		<p>a</p>
	{/snippet}
</svelte:boundary>
{#if false}
	<svelte:self>
		{#snippet children()}
			<p>b</p>
		{/snippet}
	</svelte:self>
{/if}
