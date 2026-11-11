<script>
	const items = [1, 2];
	const keys = [9, 8];
</script>

{#each items as item (keys.map((item) => item * 2)[0])}
	<span>{item}</span>
{/each}
