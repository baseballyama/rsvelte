<script>
	const rows = [{ value: "row" }];
	const q = 1;
</script>

{#each rows as value (value.value)}
{#if q}{@const value = "c"}<b>{value}</b>{/if}
<i>{value}</i>
{/each}
