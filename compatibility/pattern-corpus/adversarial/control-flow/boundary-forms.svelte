<script>
	let n = $state(0);
	function log(e) {
		console.log(e);
	}
</script>

<svelte:boundary onerror={log}>
	<p>{n.toFixed(2)}</p>
</svelte:boundary>

<svelte:boundary>
	<p>{n}</p>
	{#snippet failed(error, reset)}
		<button onclick={reset}>{String(error)}</button>
	{/snippet}
</svelte:boundary>

<svelte:boundary onerror={(e, r) => log(e) ?? r()}>
	{#if n > 0}
		<span>{n}</span>
	{/if}
	{#snippet failed(error)}
		<em>{error?.message ?? 'boom'}</em>
	{/snippet}
</svelte:boundary>
