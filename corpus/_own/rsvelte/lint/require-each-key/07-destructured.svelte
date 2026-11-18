<script>
	const items = [{ id: 1 }];
	const pairs = [[1, 2]];
</script>

{#each items as { id }}
	<span>{id}</span>
{/each}
{#each pairs as [a, b]}
	<span>{a}{b}</span>
{/each}
{#each items as { id } (id)}
	<span>{id}</span>
{/each}
