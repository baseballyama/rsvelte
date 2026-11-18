<script>
	const rows = [{ value: "row" }];
	const q = 1;
</script>

{#each rows as _r, value}
{#each rows as r}
{@const value = "c"}
<b>{value}</b>
{/each}
{/each}
