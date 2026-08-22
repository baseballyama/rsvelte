<script>
	let risky = $state(null);

	function onerror(err, reset) {
		console.error(err);
		reset();
	}
</script>

<svelte:boundary {onerror}>
	<p>{risky.definitely.throws}</p>

	{#snippet failed(error, reset)}
		<button onclick={reset}>{error.message}</button>
	{/snippet}
</svelte:boundary>

<svelte:boundary onerror={(e) => console.log(e)}>
	<p>inline only</p>
</svelte:boundary>
