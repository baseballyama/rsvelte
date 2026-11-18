<script>
	const items = [1];
	const outer = 1;
</script>

{#each items as item (outer /* item */)}
	<b>{item}</b>
{/each}
