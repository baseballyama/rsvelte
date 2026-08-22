<script>
	let a = $state(1);
	let b = $state({ c: 2 });
</script>

{@debug}
{@debug a}
{@debug a, b}

{#if a}
	{@const doubled = a * 2}
	{@debug doubled}
	<p>{doubled}</p>
{/if}

{#each [b] as item}
	{@const { c } = item}
	{@debug c}
	<p>{c}</p>
{/each}
