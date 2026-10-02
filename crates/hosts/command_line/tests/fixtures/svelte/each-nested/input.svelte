<script>
	let groups = $state([
		{ name: 'fruit', items: ['apple', 'pear'] },
		{ name: 'veg', items: ['leek'] }
	]);
</script>

{#each groups as group}
	<h2>{group.name}</h2>
	<ul>
		{#each group.items as item}
			<li>{group.name}: {item}</li>
		{/each}
	</ul>
{/each}
