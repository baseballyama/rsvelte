<svelte:boundary>
	<p>child</p>
	{#snippet pending()}
		<p>loading</p>
	{/snippet}
</svelte:boundary>