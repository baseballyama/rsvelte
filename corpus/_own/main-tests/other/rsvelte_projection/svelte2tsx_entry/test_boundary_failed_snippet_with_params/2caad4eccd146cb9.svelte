<svelte:boundary>
	<Component />
	{#snippet failed(error, reset)}
		<button onclick={reset}>retry</button>
	{/snippet}
</svelte:boundary>