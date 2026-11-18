<svelte:options runes={true} />

<script>
	let obj = { a: 1, b: 2 };
	let arr = [1, 2];
</script>

{#if obj}
	{@const { a, ...rest } = obj}
	{@const [first = 0, ...others] = arr}
	<span>{a}{Object.keys(rest).length}{first}{others.length}</span>
{/if}
