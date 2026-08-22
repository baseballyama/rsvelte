<svelte:element this={'section'}>
	{#snippet children()}
		<p>hi</p>
	{/snippet}
	{@render children()}
</svelte:element>
