<script>
	const rows = [{ value: "row" }];
	const q = 1;
</script>

{#each rows as _r, value}
{#if q}
<b>{value}</b>
{/if}
{/each}
