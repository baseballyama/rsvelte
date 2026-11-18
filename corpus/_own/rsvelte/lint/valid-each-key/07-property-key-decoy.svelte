<script>
	const items = [1];
	const outer = 2;
</script>

{#each items as item (JSON.stringify({ item: outer }))}
	<b>{item}</b>
{/each}
