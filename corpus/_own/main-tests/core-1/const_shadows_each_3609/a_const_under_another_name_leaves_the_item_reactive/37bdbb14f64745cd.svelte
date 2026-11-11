<script>
	const rows = [{ value: "row" }];
	const q = 1;
</script>

{#each rows as value (value.value)}
{#key q}
{@const other = "c"}
<b>{other}{value}</b>
{/key}
{/each}
