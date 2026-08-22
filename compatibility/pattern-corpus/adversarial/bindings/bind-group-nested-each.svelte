<script>
	let groups = $state([
		{ name: 'g1', options: ['a', 'b'], picked: 'a' },
		{ name: 'g2', options: ['c'], picked: 'c' },
	]);
	let flavors = $state([]);
</script>

{#each groups as group (group.name)}
	{#each group.options as option}
		<label>
			<input type="radio" value={option} bind:group={group.picked} />
			{option}
		</label>
	{/each}
{/each}

{#each ['mint', 'ube'] as f}
	<input type="checkbox" value={f} bind:group={flavors} />
{/each}
