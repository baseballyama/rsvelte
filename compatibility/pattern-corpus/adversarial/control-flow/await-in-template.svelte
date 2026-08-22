<script>
	const slow = Promise.resolve({ items: [1, 2] });
	let n = $state(0);
</script>

{#await slow}
	<p>loading {n}</p>
{:then { items }}
	{#each items as item (item)}
		{#await Promise.resolve(item * 2)}
			<span>…</span>
		{:then doubled}
			{#if doubled > 2}
				<b>{doubled}</b>
			{:else}
				<i>{doubled}</i>
			{/if}
		{/await}
	{/each}
{:catch}
	<p>error</p>
{/await}

{#key n}
	{#await slow then { items }}
		<p>{items.length}</p>
	{/await}
{/key}
