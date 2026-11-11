<script>
	const rows = [{ value: "row" }];
	const q = 1;
</script>

{#each rows as _r, value}
{#await Promise.resolve(1) then _}
{@const value = "c"}
<b>{value}</b>
{/await}
{/each}
