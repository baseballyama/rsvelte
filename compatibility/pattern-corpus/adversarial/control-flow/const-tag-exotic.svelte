<script>
	const items = [{ v: 1, w: [2, 3] }];
</script>

{#each items as item}
	{@const { v, w: [first, ...others] } = item}
	{@const sum = v + first + others.length}
	{@const fn = (k) => k * sum}
	<p>{fn(2)} {sum}</p>
{/each}
