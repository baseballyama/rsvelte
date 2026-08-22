<script>
	export let rows = [];
</script>

<div>
	{#each rows as row, i}
		<slot {row} index={i} let:unused let:named={alias}>row {i}</slot>
	{/each}
</div>
