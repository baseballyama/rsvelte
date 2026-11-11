<script>
	import Row from "./Component.svelte";
	const nums = $state([]);
	const rows = $derived(nums.map(n => ({id: n, name: `Row ${n}` })));
	const refs = $state({});
</script>

{#each rows as row (row.id)}
	<Row name={row.name} bind:this={refs[row.id]} />
{/each}
