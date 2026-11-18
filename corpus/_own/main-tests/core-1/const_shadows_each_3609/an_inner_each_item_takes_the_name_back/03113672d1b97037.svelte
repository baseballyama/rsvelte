<script>
	const rows = [{ value: "row" }];
	const q = 1;
</script>

{#if q}
{@const value = "c"}
{#each rows as value (value.value)}
<b>{value}</b>
{/each}
{/if}
