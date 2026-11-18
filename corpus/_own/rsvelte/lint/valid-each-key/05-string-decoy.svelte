<script>
	const items = [1];
	const map = { item: 'a' };
</script>

{#each items as item (map['item'])}
	<b>{item}</b>
{/each}
{#each items as thing (`thing`)}
	<b>{thing}</b>
{/each}
