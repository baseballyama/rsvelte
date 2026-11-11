<script>
	let items = [{ id: 1 }];
</script>

{#each items as item (item)}
	<span>{item.id}</span>
{/each}
{#each items as item (item.id)}
	<span>{item.id}</span>
{/each}
{#each items as item, i (i)}
	<span>{item.id}</span>
{/each}
{#each items as item (`k-${item.id}`)}
	<span>{item.id}</span>
{/each}
{#each items as item ({ ...item }.id)}
	<span>{item.id}</span>
{/each}
