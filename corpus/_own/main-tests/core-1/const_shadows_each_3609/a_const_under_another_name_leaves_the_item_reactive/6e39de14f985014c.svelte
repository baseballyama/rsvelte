<script>
	const rows = [{ value: "row" }];
	const q = 1;
</script>

{#each rows as value (value.value)}
{#snippet s()}
{@const other = "c"}
<b>{other}{value}</b>
{/snippet}
{@render s()}
{/each}
