<script>
	let n = $state(1);
	const slow = (v) => Promise.resolve(v * 2);
</script>

<svelte:boundary>
	<p>{await slow(n)}</p>
	<p>{(await slow(n)) + 1}</p>
	{#if await slow(n)}
		<i>truthy</i>
	{/if}
	{#each [await slow(n)] as v}
		<b>{v}</b>
	{/each}

	{#snippet pending()}
		<em>pending</em>
	{/snippet}
</svelte:boundary>

<button onclick={() => n++}>{n}</button>
