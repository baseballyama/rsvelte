<script>
	const rows = [{ value: "row" }];
	const q = 1;
</script>

{#each rows as value (value.value)}
{#snippet s()}
{@const value = "c"}
<b>{value}</b>
{/snippet}
{@render s()}
{/each}
