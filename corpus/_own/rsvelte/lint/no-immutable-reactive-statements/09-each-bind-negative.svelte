<script>
	let items = [{ done: false }];
	$: remaining = items.length;
</script>

{remaining}
{#each items as item}
	<input type="checkbox" bind:checked={item.done} />
{/each}
