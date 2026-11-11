<script>
	let raw = $state('<b>bold</b>');
	let items = $state([{ n: 1 }, { n: 2 }]);
</script>

{@html raw}
{@html raw + '<i>i</i>'}

{#each items as item}
	{@const doubled = item.n * 2}
	{@const [x, y = doubled] = [item.n]}
	{@const { n: renamed } = item}
	<p>{doubled}{x}{y}{renamed}</p>
{/each}

{#if items.length}
	{@const first = items[0]}
	{@html `<span>${first.n}</span>`}
{/if}
