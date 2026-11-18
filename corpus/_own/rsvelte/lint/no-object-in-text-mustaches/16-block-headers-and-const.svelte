<script>
	let a = 1;
</script>

{#if [a].length}
	{@const o = { a }}
	{@const arr = [a]}
	<span>{o.a}{arr.length}</span>
{/if}
{#each [{ a }] as item}
	<span>{item.a}</span>
{/each}
{@debug a}
