<script>
	let value = $state('');
	let label = 'x';
</script>

<svelte:boundary>
	<Child bind:value />
	{#snippet failed()}
		<p>{label}</p>
	{/snippet}
</svelte:boundary>
