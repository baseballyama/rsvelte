<script>
	let p = Promise.resolve([1]);
	let k = 1;
	let items = [1];
</script>

{#snippet list(xs)}
	{#each xs as x}
		<span>{x}</span>
	{/each}
{/snippet}
{@render list(items)}
{#await p then values}
	{#each values as v}
		<span>{v}</span>
	{/each}
{/await}
{#key k}
	{#each items as item}
		<span>{item}</span>
	{/each}
{/key}
