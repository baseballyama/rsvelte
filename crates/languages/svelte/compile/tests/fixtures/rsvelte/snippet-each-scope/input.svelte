<script>
	let s = 'outer';
</script>
{#each [1] as x}
	{#snippet s()}<p>{x}</p>{/snippet}
	{@render s()}
{/each}
{#each [2] as y}
	<p>{y}</p>
{/each}
{s}
