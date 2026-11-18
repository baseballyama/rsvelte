<script lang="ts">
	type Item = { id: number };
	let items: Item[] = [{ id: 1 }];
</script>

{#each items as item}
	<span>{item.id}</span>
{/each}
{#each items as item (item.id as number)}
	<span>{item.id}</span>
{/each}
{#each (items satisfies Item[]) as item}
	<span>{item.id}</span>
{/each}
