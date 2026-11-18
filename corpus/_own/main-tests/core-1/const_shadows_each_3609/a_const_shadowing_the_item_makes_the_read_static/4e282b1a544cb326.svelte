<script>
	const rows = [{ value: "row" }];
	const q = 1;
</script>

{#each rows as value (value.value)}
{#key q}
{@const value = "c"}
<b>{value}</b>
{/key}
{/each}
