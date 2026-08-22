<script>
	let n = $state(0);
	let failing = $state(false);

	function boom() {
		if (failing) throw new Error('x');
		return n;
	}
</script>

<svelte:boundary onerror={(e, reset) => reset()}>
	{#key n}
		<p>{boom()}</p>
	{/key}

	{#snippet failed(error, reset)}
		<button onclick={reset}>{String(error)}</button>
	{/snippet}
</svelte:boundary>

<button onclick={() => (failing = !failing)}>{n}</button>
