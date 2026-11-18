<script>
	const rows = [{ value: "row" }];
	const q = 1;
</script>

{#each rows as _r, value}
{#snippet s()}
{@const value = "c"}
<b>{value}</b>
{/snippet}
{@render s()}
{/each}
