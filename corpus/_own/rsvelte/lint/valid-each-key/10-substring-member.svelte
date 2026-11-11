<script>
	const items = [1];
	const item2 = 'a';
	const thing_item = 'b';
	const outer = { item: 3 };
</script>

{#each items as item (item2)}
	<b>{item}</b>
{/each}
{#each items as item (thing_item)}
	<b>{item}</b>
{/each}
{#each items as item (outer.item)}
	<b>{item}</b>
{/each}
