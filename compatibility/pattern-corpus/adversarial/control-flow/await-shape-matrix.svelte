<script>
	let { promise, list = [] } = $props();
	const inner = Promise.resolve({ a: 1, b: [2, 3] });
</script>

{#await promise}
	<p>pending</p>
{:then { a, b: [first, ...rest] }}
	<p>{a} {first} {rest.length}</p>
{:catch { message = 'none', ...err }}
	<p>{message} {Object.keys(err).length}</p>
{/await}

{#await inner then value}
	{#await Promise.resolve(value.a) then nested}
		<span>{nested}</span>
	{/await}
{/await}

{#await promise catch e}
	<span>{e}</span>
{/await}

{#each list as item}
	{#await item.load() then loaded}
		{#if loaded}
			{#await loaded.next() then deep}
				<b>{deep}</b>
			{:catch}
				<b>failed</b>
			{/await}
		{/if}
	{/await}
{/each}
