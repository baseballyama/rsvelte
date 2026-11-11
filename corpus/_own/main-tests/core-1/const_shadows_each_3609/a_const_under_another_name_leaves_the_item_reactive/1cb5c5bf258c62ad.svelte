<script>
	const rows = [{ value: "row" }];
	const q = 1;
</script>

{#each rows as value (value.value)}
{#each rows as r}
{@const other = "c"}
<b>{other}{value}</b>
{/each}
{/each}
