<script>
	const rows = [{ value: "row" }];
	const q = 1;
</script>

{#each rows as _r, value}
{#snippet s(value)}
<b>{value}</b>
{/snippet}
{@render s(1)}
{/each}
