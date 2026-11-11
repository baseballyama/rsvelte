<script>
	let items = [{ id: 1, a: 1, b: 2 }];
	let v = 1;
</script>

{#each items as item, i (item.id) }
	{i}{item.a}
{:else }
	empty
{/each}

{#each items as { a, b } }
	{a}{b}
{/each}

{#key v }
	{v}
{/key }
