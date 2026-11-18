<script>
	let obj = { a: 1 };
	let a = 1, b = 2, c = 3, x = 4, y = 5;
</script>

{#snippet s(p = obj.a ? (obj.a ? 1 : 2) : 3)}
	{p}
{/snippet}

{@render s()}
