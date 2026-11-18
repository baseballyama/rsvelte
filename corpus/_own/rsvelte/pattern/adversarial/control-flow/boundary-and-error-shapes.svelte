<script>
	let { fail = false } = $props();
	let attempts = $state(0);

	function boom() {
		if (fail) throw new Error('boom');
		return 'ok';
	}
</script>

<svelte:boundary onerror={(error, reset) => { attempts++; reset(); }}>
	<p>{boom()}</p>

	{#snippet failed(error, reset)}
		<button onclick={reset}>retry {attempts}: {error.message}</button>
	{/snippet}
</svelte:boundary>

<svelte:boundary>
	{#snippet pending()}
		<span>loading</span>
	{/snippet}
	{#snippet failed(e)}
		<span>{e}</span>
	{/snippet}
	<p>inner</p>
</svelte:boundary>
