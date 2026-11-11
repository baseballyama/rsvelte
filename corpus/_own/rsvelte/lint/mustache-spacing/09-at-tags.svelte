<script>
	let html = '<b>x</b>';
	let a = 1;
	let b = 2;
</script>

{#each [1] as i}
	{@const c = a + b + i }
	{@html  html }
	{c}
{/each}
{@debug a, b }
{ @render chunk(a)}

{#snippet chunk(n)}
	{n}
{/snippet}
