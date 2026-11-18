<script>
	function report() {
		return () => {};
	}
</script>

<svelte:boundary>
	<p>content</p>

	{#snippet failed(error)}
		<p {@attach report()}>{error}</p>
	{/snippet}
</svelte:boundary>
