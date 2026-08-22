<script>
	let suffix = $state('s');
	let entries = $state([{ id: 1, kids: [{ id: 10 }] }]);
</script>

{#await (async () => suffix.toUpperCase())() then up}
	<p>{up}</p>
{/await}

{#each entries as entry (entry.id + suffix)}
	{#each entry.kids as kid (`${entry.id}:${kid.id}:${suffix}`)}
		<p>{kid.id}</p>
	{/each}
{/each}
