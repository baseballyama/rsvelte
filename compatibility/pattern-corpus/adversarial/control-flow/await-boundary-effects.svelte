<script>
	let p = $state(Promise.resolve(1));
	let n = $state(0);

	$effect.pre(() => {
		n;
	});

	$effect(() => {
		const id = setTimeout(() => {}, 0);
		return () => clearTimeout(id);
	});
</script>

<svelte:boundary onerror={(e, reset) => reset()}>
	{#await p}
		<p>pending</p>
	{:then v}
		{#await Promise.resolve(v) then w}
			<p>{w}</p>
		{/await}
	{:catch e}
		<p>{e.message}</p>
	{/await}

	{#snippet failed(error, reset)}
		<button onclick={reset}>{error.message}</button>
	{/snippet}
</svelte:boundary>

{#await p}{:then v}{v}{/await}
{#await p then}<i>bare-then</i>{/await}
<button onclick={() => (p = Promise.reject(new Error('x')))}>{n}</button>
